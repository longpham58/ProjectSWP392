package com.itms.dto;

import com.itms.common.CourseStatus;
import com.itms.common.Level;
import com.itms.common.MaterialType;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CourseDto {

    private Integer id;
    private String code;
    private String name;
    private String title; // Alias for name
    private String description;
    private String objectives;
    private String prerequisites;
    private Double durationHours;
    private String duration; // Human readable duration
    private String trainer;
    private String instructor; // Alias for trainer
    private String category;
    private Level level;
    private String thumbnailUrl;
    private Double passingScore;
    private Integer maxAttempts;
    private CourseStatus status;
    private LocalDateTime createdAt;
    private String startDate;
    private String endDate;
    private List<MaterialDto> materials;
    private List<FeedbackDto> feedbacks;

    /**
     * Inner class for MaterialDto
     */
    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class MaterialDto {
        private Long id;
        private String title;
        private String description;
        private MaterialType type;
        private String fileUrl;
        private Long fileSize;
        private Integer displayOrder;
        private Boolean isRequired;
        private Boolean isDownloadable;
        private LocalDateTime createdAt;
    }

    /**
     * Build CourseDto from Course entity
     */
    public static CourseDto fromEntity(com.itms.entity.Course course) {
        return CourseDto.builder()
                .id(course.getId())
                .code(course.getCode())
                .name(course.getName())
                .title(course.getName()) // Alias
                .description(course.getDescription())
                .objectives(course.getObjectives())
                .prerequisites(course.getPrerequisites())
                .durationHours(course.getDurationHours())
                .duration(course.getDurationHours() != null ? 
                        formatDuration(course.getDurationHours()) : null)
                .trainer(course.getTrainer() != null ? course.getTrainer().getFullName() : null)
                .instructor(course.getTrainer() != null ? course.getTrainer().getFullName() : null) // Alias
                .category(course.getCategory())
                .level(course.getLevel())
                .thumbnailUrl(course.getThumbnailUrl())
                .passingScore(course.getPassingScore())
                .maxAttempts(course.getMaxAttempts())
                .status(course.getStatus())
                .createdAt(course.getCreatedAt())
                .build();
    }



    /**
     * Format duration in hours to human readable string
     */
    private static String formatDuration(Double hours) {
        if (hours == null) return null;
        
        int totalMinutes = (int) (hours * 60);
        int hrs = totalMinutes / 60;
        int mins = totalMinutes % 60;
        
        if (hrs > 0 && mins > 0) {
            return hrs + "h " + mins + "m";
        } else if (hrs > 0) {
            return hrs + "h";
        } else {
            return mins + "m";
        }
    }
}
