package com.itms.service;

import com.itms.common.CourseStatus;
import com.itms.dto.CourseDto;
import com.itms.dto.HrCourseDto;
import com.itms.dto.HrTrainerDto;
import com.itms.dto.TrainerScheduleDto;
import com.itms.entity.*;
import com.itms.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {
    private final CourseRepository courseRepository;
    private final SessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final JdbcTemplate jdbcTemplate;
    private final ClassMemberRepository classMemberRepository;
    private final ClassRoomRepository classRoomRepository;
    private final AttendanceRepository attendanceRepository;


    /**
     * Get courses for a user with enrollment info (returns CourseDto)
     */
    public List<CourseDto> getCourseDtosByUserId(Integer userId) {
        return courseRepository.findCoursesByUserId(userId)
                .stream()
                .map(course -> {
                    CourseDto dto = CourseDto.fromEntity(course);
                    // Add attendance info for each course
                    populateAttendanceInfo(dto, userId);
                    return dto;
                })
                .toList();
    }

    /**
     * Populate attendance info for a course based on user's attendance in that course's classes
     */
    private void populateAttendanceInfo(CourseDto dto, Integer userId) {
        // Get classes for this course
        List<ClassRoom> classes = classRoomRepository.findByCourseId(dto.getId());
        
        if (classes.isEmpty()) {
            dto.setTotalSessions(0);
            dto.setAttendedSessions(0);
            dto.setProgressPercentage(0);
            return;
        }
        
        // Get the first active class the user is a member of
        ClassMember member = classMemberRepository.findByUserIdAndClassRoomCourseIdAndStatus(userId, dto.getId(), "ACTIVE")
                .orElse(null);
        
        if (member != null) {
            dto.setClassName(member.getClassRoom().getClassName());
            dto.setClassCode(member.getClassRoom().getClassCode());
        }
        
        // Get all sessions for these classes
        List<Integer> classIds = classes.stream().map(ClassRoom::getId).collect(Collectors.toList());
        List<Session> sessions = sessionRepository.findByClassRoomIdIn(classIds);
        
        int totalSessions = sessions.size();
        
        if (totalSessions == 0) {
            dto.setTotalSessions(0);
            dto.setAttendedSessions(0);
            dto.setProgressPercentage(0);
            return;
        }
        
        // Populate start and end dates from sessions
        if (!sessions.isEmpty()) {
            LocalDate minDate = sessions.stream()
                .map(Session::getDate)
                .min(LocalDate::compareTo)
                .orElse(null);
            LocalDate maxDate = sessions.stream()
                .map(Session::getDate)
                .max(LocalDate::compareTo)
                .orElse(null);
            if (minDate != null) {
                dto.setStartDate(minDate.toString());
            }
            if (maxDate != null) {
                dto.setEndDate(maxDate.toString());
            }
        }
        
        // Count attended sessions
        List<Long> sessionIds = sessions.stream().map(Session::getId).collect(Collectors.toList());
        int attendedSessions = attendanceRepository.countByUserIdAndSessionIds(userId, sessionIds);
        
        dto.setTotalSessions(totalSessions);
        dto.setAttendedSessions(attendedSessions);
        dto.setProgressPercentage(totalSessions > 0 ? (int) Math.round((attendedSessions * 100.0) / totalSessions) : 0);
    }

    public CourseDto getCourseById(Integer id) {
        CourseDto dto = courseRepository.findById(id)
                .map(CourseDto::fromEntity)
                .orElseThrow(() -> new EntityNotFoundException("Course not found with id: " + id));
        return dto;
    }

    public CourseDto getCourseByIdWithAttendance(Integer id, Integer userId) {
        CourseDto dto = courseRepository.findById(id)
                .map(CourseDto::fromEntity)
                .orElseThrow(() -> new EntityNotFoundException("Course not found with id: " + id));
        populateAttendanceInfo(dto, userId);
        return dto;
    }

    /**
     * Get courses assigned to a trainer
     */
    public List<Course> getCoursesByTrainerId(Integer trainerId) {
        return courseRepository.findByTrainerId(trainerId);
    }

    /**
     * Get schedule for a trainer (all sessions created by the trainer)
     */
    public List<TrainerScheduleDto> getScheduleByTrainerId(Integer trainerId) {
        List<Session> sessions = sessionRepository.findByTrainerIdOrderByDateAsc(trainerId);

        return sessions.stream()
                .map(session -> TrainerScheduleDto.builder()
                        .sessionId(session.getId())
                        .sessionNumber(session.getId().intValue()) // Use session ID as session number
                        .date(session.getDate())
                        .timeStart(session.getTimeStart())
                        .timeEnd(session.getTimeEnd())
                        .location(session.getLocation())
                        .status(session.getStatus())
                        .meetingLink(session.getMeetingLink())
                        .courseId(session.getCourse().getId())
                        .courseCode(session.getCourse().getCode())
                        .courseName(session.getCourse().getName())
                        .dayOfWeek(session.getDate().getDayOfWeek() == DayOfWeek.SUNDAY ? 0 :
                                session.getDate().getDayOfWeek().getValue())
                        .build())
                .collect(Collectors.toList());
    }

    // =========================
    // HR management helpers
    // =========================

    public List<HrCourseDto> getAllCoursesForHr() {
        return courseRepository.findAll().stream()
                .map(this::toHrDto)
                .toList();
    }

    public HrCourseDto createCourseForHr(HrCourseDto dto) {
        Course course = new Course();
        applyHrDtoToEntity(dto, course);
        if (course.getCode() == null || course.getCode().isBlank()) {
            throw new IllegalArgumentException("Course code is required");
        }
        if (course.getName() == null || course.getName().isBlank()) {
            throw new IllegalArgumentException("Course name is required");
        }
        if (course.getStatus() == null) {
            course.setStatus(CourseStatus.DRAFT);
        }
        Course saved = courseRepository.save(course);
        return toHrDto(saved);
    }

    public HrCourseDto updateCourseForHr(Integer id, HrCourseDto dto) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Course not found with id: " + id));
        applyHrDtoToEntity(dto, course);
        Course saved = courseRepository.save(course);
        return toHrDto(saved);
    }

    @Transactional
    public void deleteCourseForHr(Integer id) {
        if (!courseRepository.existsById(id)) {
            throw new EntityNotFoundException("Course not found with id: " + id);
        }
        courseRepository.deleteById(id);
        reseedCourseIdentityToCurrentMax();
    }

    public List<HrTrainerDto> getActiveTrainersForHr() {
        return userRepository.findAllActiveTrainers().stream()
                .map(u -> HrTrainerDto.builder()
                        .username(u.getUsername())
                        .fullName(u.getFullName())
                        .build())
                .collect(Collectors.toList());
    }

    private HrCourseDto toHrDto(Course c) {
        User trainer = c.getTrainer();
        String trainerUsername = trainer != null ? trainer.getUsername() : null;
        String trainerName = trainer != null ? trainer.getFullName() : null;
        String departmentName = trainer != null && trainer.getDepartment() != null
                ? trainer.getDepartment().getName()
                : null;

        return HrCourseDto.builder()
                .id(c.getId())
                .code(c.getCode())
                .name(c.getName())
                .category(c.getCategory())
                .description(c.getDescription())
                .status(c.getStatus() != null ? c.getStatus().name() : null)
                .trainerUsername(trainerUsername)
                .trainerName(trainerName)
                .trainerId(trainer != null ? trainer.getId() : null)
                .departmentName(departmentName)
                .build();
    }

    private void applyHrDtoToEntity(HrCourseDto dto, Course course) {
        if (dto.getCode() != null) {
            course.setCode(dto.getCode().trim());
        }
        if (dto.getName() != null) {
            course.setName(dto.getName().trim());
        }
        if (dto.getCategory() != null) {
            course.setCategory(dto.getCategory());
        }
        if (dto.getDescription() != null) {
            course.setDescription(dto.getDescription());
        }
        if (dto.getStatus() != null) {
            try {
                course.setStatus(CourseStatus.valueOf(dto.getStatus().toUpperCase()));
            } catch (IllegalArgumentException ex) {
                throw new IllegalArgumentException("Invalid course status: " + dto.getStatus());
            }
        }

        if (dto.getTrainerUsername() != null && !dto.getTrainerUsername().isBlank()) {
            User trainer = userRepository.findByUsername(dto.getTrainerUsername())
                    .orElse(null);
            // Do not fail the whole create/update if trainer username is not found.
            // This prevents 400 when stale UI values are submitted.
            if (trainer != null) {
                course.setTrainer(trainer);
            }
        }
    }

    /**
     * SQL Server: keep next identity close to current max id.
     * Example: delete highest id 17 -> next insert can become 17 again.
     */
    private void reseedCourseIdentityToCurrentMax() {
        Integer maxId = courseRepository.findMaxId();
        int seed = maxId == null ? 0 : maxId;
        jdbcTemplate.execute("DBCC CHECKIDENT ('Course', RESEED, " + seed + ")");
    }
}
