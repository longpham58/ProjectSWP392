package com.itms.service;

import com.itms.dto.CourseScheduleDto;
import com.itms.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SessionService {

    private final SessionRepository sessionRepository;

    /**
     * Get course schedule for the current user
     */
    public List<CourseScheduleDto> getCourseSchedule(Integer userId) {
        return sessionRepository.findByUserIdOrderByDateAsc(userId)
                .stream()
                .map(CourseScheduleDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get course schedule for a specific course
     */
    public List<CourseScheduleDto> getCourseScheduleByCourse(Integer userId, Integer courseId) {
        return sessionRepository.findByUserIdAndCourseIdOrderByDateAsc(userId, courseId)
                .stream()
                .map(CourseScheduleDto::fromEntity)
                .collect(Collectors.toList());
    }
}
