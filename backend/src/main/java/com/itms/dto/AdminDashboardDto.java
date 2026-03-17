package com.itms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardDto {
    // User Stats
    private Long totalUsers;
    private Long activeUsers;
    private Long lockedAccounts;
    
    // Security
    private Long failedLoginAttempts;
    private Long securityAlerts;
    
    // Content Stats
    private Long totalCourses;
    private Long activeCourses;
    private Long totalClasses;
    private Long totalEnrollments;
    
    // Feedback
    private Long openFeedback;
    
    // Charts Data
    private Map<String, Long> roleDistribution;
    private List<MonthlyCompletion> monthlyCompletion;
    private List<RecentActivity> recentActivities;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyCompletion {
        private String month;
        private Long completions;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentActivity {
        private String description;
        private String timeAgo;
        private Long count;
    }
}
