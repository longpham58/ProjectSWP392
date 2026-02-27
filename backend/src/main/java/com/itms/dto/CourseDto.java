package com.itms.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseDto {
    private Integer id;
    private String code;
    private String name;
    private String description;
    private String objectives;
    private String prerequisites;
    private BigDecimal durationHours;
    private String category;
    private String level;
    private String thumbnailUrl;
    private BigDecimal passingScore;
    private Integer maxAttempts;
    private String status;
    private String trainerName;
}
