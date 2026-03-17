package com.itms.dto;

import com.itms.common.CourseStatus;
import com.itms.common.Level;
import com.itms.entity.Course;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminCourseDto {
    private Integer id;
    private String code;
    private String name;
    private String description;
    private Double durationHours;
    private String category;
    private Level level;
    private Double passingScore;
    private Integer maxAttempts;
    private CourseStatus status;
    private String trainerName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Class and student counts
    private Long classCount;
    private Long studentCount;
    
    public static AdminCourseDto fromEntity(Course course, Long classCount, Long studentCount) {
        return AdminCourseDto.builder()
                .id(course.getId())
                .code(course.getCode())
                .name(course.getName())
                .description(course.getDescription())
                .durationHours(course.getDurationHours())
                .category(course.getCategory())
                .level(course.getLevel())
                .passingScore(course.getPassingScore())
                .maxAttempts(course.getMaxAttempts())
                .status(course.getStatus())
                .trainerName(course.getTrainer() != null ? course.getTrainer().getFullName() : null)
                .createdAt(course.getCreatedAt())
                .updatedAt(course.getUpdatedAt())
                .classCount(classCount)
                .studentCount(studentCount)
                .build();
    }
}
