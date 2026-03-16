package com.itms.service;

import com.itms.common.CourseStatus;
import com.itms.dto.AdminDashboardDto;
import com.itms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final ClassRoomRepository classRoomRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final FeedbackRepository feedbackRepository;
    private final ClassMemberRepository classMemberRepository;

    public AdminDashboardDto getDashboardStats() {
        // User stats
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByIsActive(true);
        long lockedAccounts = 0; // No locked accounts feature

        // Course stats
        long totalCourses = courseRepository.count();
        long activeCourses = courseRepository.countByStatus(CourseStatus.ACTIVE);

        // Class stats
        long totalClasses = classRoomRepository.count();

        // Enrollment stats (via ClassMember)
        long totalEnrollments = classMemberRepository.count();

        // Feedback stats
        long openFeedback = feedbackRepository.count();

        return AdminDashboardDto.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .lockedAccounts(lockedAccounts)
                .openFeedback(openFeedback)
                .totalCourses(totalCourses)
                .activeCourses(activeCourses)
                .totalClasses(totalClasses)
                .totalEnrollments(totalEnrollments)
                .build();
    }
}
