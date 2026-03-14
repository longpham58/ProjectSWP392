package com.itms.service;

import com.itms.common.CourseStatus;
import com.itms.dto.CourseDto;
import com.itms.dto.HrCourseDto;
import com.itms.dto.HrTrainerDto;
import com.itms.dto.TrainerScheduleDto;
import com.itms.entity.Course;
import com.itms.entity.Enrollment;
import com.itms.entity.Session;
import com.itms.entity.User;
import com.itms.repository.CourseRepository;
import com.itms.repository.EnrollmentRepository;
import com.itms.repository.SessionRepository;
import com.itms.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
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


    /**
     * Get courses for a user with enrollment info (returns CourseDto)
     */
    public List<CourseDto> getCourseDtosByUserId(Integer userId) {
        return courseRepository.findCoursesByUserId(userId)
                .stream()
                .map(CourseDto::fromEntity)
                .toList();
    }

    public CourseDto getCourseById(Integer id) {
        return courseRepository.findById(id)
                .map(CourseDto::fromEntity)
                .orElseThrow(() -> new EntityNotFoundException("Course not found with id: " + id));
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
                        .sessionName(session.getSessionName())
                        .sessionNumber(session.getSessionNumber())
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
                .toList();
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
                .toList();
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
