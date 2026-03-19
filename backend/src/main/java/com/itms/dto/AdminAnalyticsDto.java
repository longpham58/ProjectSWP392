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
    private Long activeUsers7d;
    private Long totalCourses;
    private Long activeCourses;
    private Long totalClasses;
    private Long totalEnrollments;
    private Long enrollmentGrowth;
    private Long completionRate;
    private Long securityAlerts;
    
    // Monthly completion trend
    private List<MonthlyCompletionDto> monthlyCompletion;
    
    // Monthly attendance trend
    private List<MonthlyCompletionDto> monthlyAttendance;
    
    // Monthly enrollment trend
    private List<MonthlyCompletionDto> monthlyEnrollment;
    
    // Department completion
    private List<DepartmentCompletionDto> departmentCompletion;
    
    // Course completion
    private List<CourseCompletionDto> courseCompletion;
    
    // Training hours trend
    private List<TrainingHoursDto> trainingHours;
    
    // Employee performance distribution
    private List<EmployeePerformanceDto> employeePerformance;
    
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
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmployeePerformanceDto {
        private String level;
        private Long value;
    }
}
