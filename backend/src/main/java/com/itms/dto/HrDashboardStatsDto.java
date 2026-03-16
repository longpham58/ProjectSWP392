package com.itms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HrDashboardStatsDto {
    private long totalCourses;
    private long totalSchedules;
    private long totalNotifications;
    private long totalTrainers;
}
