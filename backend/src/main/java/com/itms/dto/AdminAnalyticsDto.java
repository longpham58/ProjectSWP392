package com.itms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminAnalyticsDto {
    
    // KPIs
    private Long totalEmployees;
    private Long lockedAccounts;
    private Long totalClasses;
    private Long totalEnrollments;
    private Long securityAlerts;
    
    // Monthly completion trend
    private List<MonthlyCompletionDto> monthlyCompletion;
    
    // Department completion
    private List<DepartmentCompletionDto> departmentCompletion;
    
    // Course completion
    private List<CourseCompletionDto> courseCompletion;
    
    // Training hours trend
    private List<TrainingHoursDto> trainingHours;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyCompletionDto {
        private String month;
        private Long completions;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DepartmentCompletionDto {
        private String name;
        private Long totalUsers;
        private Long completedUsers;
        private Integer completionRate;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CourseCompletionDto {
        private String name;
        private Long totalEnrollments;
        private Long completedEnrollments;
        private Integer completionRate;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrainingHoursDto {
        private String month;
        private Double totalHours;
        private Double avgHoursPerUser;
    }
}
