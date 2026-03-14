package com.itms.service;

import com.itms.entity.Course;
import com.itms.entity.Enrollment;
import com.itms.repository.CourseRepository;
import com.itms.repository.EnrollmentRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;

    public List<Course> getCoursesByUserId(int userId) {
        List<Enrollment> enrollments = enrollmentRepository.findByUserId(userId);
        return enrollments.stream()
                .map(e -> e.getSession().getCourse()).distinct()
                .toList();
    }

    public Course getCourseById(int id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Course not found with id: " + id));
    }

<<<<<<< Updated upstream
=======
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

>>>>>>> Stashed changes
}
