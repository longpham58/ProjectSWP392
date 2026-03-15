package com.itms.service;

import com.itms.dto.TrainerScheduleDto;
import com.itms.entity.ClassRoom;
import com.itms.entity.CourseSchedule;
import com.itms.repository.ClassRoomRepository;
import com.itms.repository.CourseScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TrainerScheduleService {

    private final ClassRoomRepository classRoomRepository;
    private final CourseScheduleRepository courseScheduleRepository;

    // Map dayOfWeek string to Java DayOfWeek (supports both MON and MONDAY formats)
    private static final Map<String, DayOfWeek> DAY_MAP = Map.of(
        "MON",       DayOfWeek.MONDAY,
        "TUE",       DayOfWeek.TUESDAY,
        "WED",       DayOfWeek.WEDNESDAY,
        "THU",       DayOfWeek.THURSDAY,
        "FRI",       DayOfWeek.FRIDAY,
        "SAT",       DayOfWeek.SATURDAY,
        "SUN",       DayOfWeek.SUNDAY
    );

    /**
     * Get trainer's schedule by generating recurring sessions from CourseSchedule
     * within each course's startDate - endDate range.
     */
    public List<TrainerScheduleDto> getTrainerSchedule(Integer trainerId) {
        List<ClassRoom> classRooms = classRoomRepository.findByTrainerId(trainerId);
        List<TrainerScheduleDto> result = new ArrayList<>();

        for (ClassRoom classRoom : classRooms) {
            if (classRoom.getCourse() == null) continue;

            LocalDate startDate = classRoom.getCourse().getStartDate();
            LocalDate endDate = classRoom.getCourse().getEndDate();
            if (startDate == null || endDate == null) continue;

            List<CourseSchedule> schedules = courseScheduleRepository.findByClassRoomId(classRoom.getId());

            for (CourseSchedule schedule : schedules) {
                DayOfWeek targetDay = DAY_MAP.get(
                    schedule.getDayOfWeek() != null ? schedule.getDayOfWeek().toUpperCase() : ""
                );
                if (targetDay == null) continue;

                // Generate all dates from startDate to endDate that match targetDay
                LocalDate current = startDate;
                // Advance to first occurrence of targetDay
                while (current.getDayOfWeek() != targetDay) {
                    current = current.plusDays(1);
                }

                int sessionNumber = 1;
                while (!current.isAfter(endDate)) {
                    result.add(TrainerScheduleDto.builder()
                        .sessionId(null)
                        .sessionName("Buổi " + sessionNumber)
                        .sessionNumber(sessionNumber)
                        .date(current)
                        .timeStart(schedule.getTimeStart())
                        .timeEnd(schedule.getTimeEnd())
                        .location(schedule.getLocation())
                        .locationType(schedule.getLocationType())
                        .meetingLink(schedule.getMeetingLink())
                        .status(com.itms.common.SessionStatus.SCHEDULED)
                        .courseId(classRoom.getCourse().getId())
                        .courseCode(classRoom.getCourse().getCode())
                        .courseName(classRoom.getCourse().getName())
                        .classCode(classRoom.getClassCode())
                        .trainerName(classRoom.getTrainer() != null ? classRoom.getTrainer().getFullName() : "")
                        .maxCapacity(classRoom.getMaxStudents() != null ? classRoom.getMaxStudents() : 0)
                        .currentEnrolled(0)
                        .build());

                    current = current.plusWeeks(1);
                    sessionNumber++;
                }
            }
        }

        // Sort by date then timeStart
        result.sort((a, b) -> {
            int cmp = a.getDate().compareTo(b.getDate());
            if (cmp != 0) return cmp;
            return a.getTimeStart().compareTo(b.getTimeStart());
        });

        return result;
    }
}
