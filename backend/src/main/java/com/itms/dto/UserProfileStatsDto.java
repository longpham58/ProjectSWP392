package com.itms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileStatsDto {
    private Integer totalCourses;
    private Integer completedCourses;
    private Integer certificates;
    private Double averageScore;
}
