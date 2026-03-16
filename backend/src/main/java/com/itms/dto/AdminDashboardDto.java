package com.itms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardDto {
    private Long totalUsers;
    private Long activeUsers;
    private Long lockedAccounts;
    private Long openFeedback;
    private Long totalCourses;
    private Long activeCourses;
    private Long totalClasses;
    private Long totalEnrollments;
}
