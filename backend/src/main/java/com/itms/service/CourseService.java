package com.itms.service;

import com.itms.dto.CourseDto;
import com.itms.dto.TrainerScheduleDto;
import com.itms.entity.Course;
import com.itms.entity.Session;
import com.itms.repository.CourseRepository;
import com.itms.repository.SessionRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final SessionRepository sessionRepository;


    /**
     * Get courses for a user through ClassMember -> ClassRoom -> Course
     */
    public List<CourseDto> getCourseDtosByUserId(Integer userId) {
        return courseRepository.findCoursesByUserIdThroughClassMember(userId)
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
                        .sessionName("Session " + session.getId()) // Generate session name from ID
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
}
