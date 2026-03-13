package com.itms.service;

import com.itms.dto.TrainerScheduleDto;
import com.itms.entity.Course;
import com.itms.entity.Session;
import com.itms.repository.CourseRepository;
import com.itms.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrainerScheduleService {

    private final SessionRepository sessionRepository;
    private final CourseRepository courseRepository;

    /**
     * Get all sessions for a trainer
     */
    public List<TrainerScheduleDto> getTrainerSchedule(Integer trainerId) {
        System.out.println("🔍 [TrainerScheduleService] Getting schedule for trainer ID: " + trainerId);
        
        List<Session> sessions = sessionRepository.findByTrainerId(trainerId);
        
        System.out.println("📅 [TrainerScheduleService] Found " + sessions.size() + " sessions");
        
        return sessions.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get session by ID (with trainer validation)
     */
    public TrainerScheduleDto getSessionById(Long sessionId, Integer trainerId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        
        // Validate that this session belongs to the trainer
        if (!session.getCourse().getTrainer().getId().equals(trainerId)) {
            throw new RuntimeException("Access denied: Session does not belong to this trainer");
        }
        
        return convertToDto(session);
    }

    /**
     * Get trainer's courses for dropdown
     */
    public List<Course> getTrainerCourses(Integer trainerId) {
        return courseRepository.findByTrainerId(trainerId);
    }

    /**
     * Convert Session entity to DTO
     */
    private TrainerScheduleDto convertToDto(Session session) {
        // Calculate day of week (0 = Sunday, 6 = Saturday)
        int dayOfWeek = session.getDate().getDayOfWeek().getValue() % 7;
        
        // Calculate slot based on time
        int slot = calculateSlot(session.getTimeStart());
        
        // Get session_number by counting previous sessions
        Integer sessionNumber = sessionRepository.getSessionNumber(
                session.getClassRoom().getId(),
                session.getDate(),
                session.getTimeStart()
        );
        
        // Get class info
        String classCode = session.getClassRoom() != null ? session.getClassRoom().getClassCode() : "";
        
        // Get trainer info
        String trainerName = session.getTrainer() != null ? session.getTrainer().getFullName() : "";
        
        return TrainerScheduleDto.builder()
                .id(session.getId())
                .sessionNumber(sessionNumber != null ? sessionNumber : 0)
                .date(session.getDate())
                .timeStart(session.getTimeStart())
                .timeEnd(session.getTimeEnd())
                .location(session.getLocation())
                .locationType(session.getLocationType())
                .meetingLink(session.getMeetingLink())
                .status(session.getStatus())
                .courseId(session.getCourse().getId())
                .courseCode(session.getCourse().getCode())
                .courseName(session.getCourse().getName())
                .classCode(classCode)
                .trainerName(trainerName)
                .maxCapacity(session.getMaxCapacity())
                .currentEnrolled(session.getCurrentEnrolled())
                .dayOfWeek(dayOfWeek)
                .slot(slot)
                .build();
    }

    /**
     * Calculate slot number based on start time
     * Slot 1: 07:00
     * Slot 2: 08:00
     * Slot 3: 09:00
     * Slot 4: 10:00
     * Slot 5: 11:00
     * Slot 6: 12:00
     * Slot 7: 13:00
     * Slot 8: 14:00
     * Slot 9: 15:00
     * Slot 10: 16:00
     * Slot 11: 17:00
     */
    private int calculateSlot(LocalTime startTime) {
        int hour = startTime.getHour();
        
        if (hour < 7) return 1;
        if (hour >= 17) return 11;
        
        return hour - 6; // 07:00 = slot 1, 08:00 = slot 2, etc.
    }
}
