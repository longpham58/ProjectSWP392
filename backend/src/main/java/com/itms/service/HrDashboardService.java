package com.itms.service;

import com.itms.dto.HrDashboardStatsDto;
import com.itms.repository.CourseRepository;
import com.itms.repository.NotificationRepository;
import com.itms.repository.SessionRepository;
import com.itms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class HrDashboardService {

    private final CourseRepository courseRepository;
    private final SessionRepository sessionRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public HrDashboardStatsDto getStats() {
        return HrDashboardStatsDto.builder()
                .totalCourses(courseRepository.count())
                .totalSchedules(sessionRepository.count())
                .totalNotifications(notificationRepository.count())
                .totalTrainers(userRepository.countActiveUsersByRoleCode("TRAINER"))
                .build();
    }
}
