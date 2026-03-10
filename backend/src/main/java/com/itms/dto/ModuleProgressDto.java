package com.itms.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModuleProgressDto {

    private Integer id;
    private Integer userId;
    private Integer moduleId;
    private String moduleTitle;
    private Integer courseId;
    private String courseName;
    private Integer enrollmentId;
    private Boolean isCompleted;
    private LocalDateTime completedAt;
    private BigDecimal progressPercentage;
    private Integer timeSpentMinutes;
    private LocalDateTime lastAccessedAt;
    private LocalDateTime createdAt;
}
