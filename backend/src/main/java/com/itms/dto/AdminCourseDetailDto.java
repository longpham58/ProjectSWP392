package com.itms.dto;

import com.itms.common.CourseStatus;
import com.itms.common.Level;
import com.itms.common.MaterialType;
import com.itms.entity.Course;
import com.itms.entity.Material;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminCourseDetailDto {
    private Integer id;
    private String code;
    private String name;
    private String description;
    private String objectives;
    private String prerequisites;
    private Double durationHours;
    private String category;
    private Level level;
    private Double passingScore;
    private Integer maxAttempts;
    private CourseStatus status;
    private String trainerName;
    private Integer trainerId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long classCount;
    private Long studentCount;
    
    // Materials
    private List<MaterialDto> materials;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MaterialDto {
        private Long id;
        private String title;
        private String description;
        private String type;
        private String fileUrl;
        private Long fileSize;
        private Integer displayOrder;
        private Boolean isRequired;
        private Boolean isDownloadable;
        private LocalDateTime createdAt;
    }
    
    public static AdminCourseDetailDto fromEntity(Course course, Long classCount, Long studentCount, List<Material> materials) {
        List<MaterialDto> materialDtos = materials.stream()
                .map(m -> MaterialDto.builder()
                        .id(m.getId())
                        .title(m.getTitle())
                        .description(m.getDescription())
                        .type(m.getType() != null ? m.getType().name() : null)
                        .fileUrl(m.getFileUrl())
                        .fileSize(m.getFileSize())
                        .displayOrder(m.getDisplayOrder())
                        .isRequired(m.getIsRequired())
                        .isDownloadable(m.getIsDownloadable())
                        .createdAt(m.getCreatedAt())
                        .build())
                .toList();
        
        return AdminCourseDetailDto.builder()
                .id(course.getId())
                .code(course.getCode())
                .name(course.getName())
                .description(course.getDescription())
                .objectives(course.getObjectives())
                .prerequisites(course.getPrerequisites())
                .durationHours(course.getDurationHours())
                .category(course.getCategory())
                .level(course.getLevel())
                .passingScore(course.getPassingScore())
                .maxAttempts(course.getMaxAttempts())
                .status(course.getStatus())
                .trainerName(course.getTrainer() != null ? course.getTrainer().getFullName() : null)
                .trainerId(course.getTrainer() != null ? course.getTrainer().getId() : null)
                .createdAt(course.getCreatedAt())
                .updatedAt(course.getUpdatedAt())
                .classCount(classCount)
                .studentCount(studentCount)
                .materials(materialDtos)
                .build();
    }
}
