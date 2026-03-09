package com.itms.dto;

import com.itms.common.MaterialType;
import com.itms.entity.CourseModule;
import com.itms.entity.Material;
import com.itms.entity.Quiz;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
public class CourseModuleDto {

    private Integer id;
    private String title;
    private String description;
    private Integer displayOrder;
    private List<MaterialDto> materials;
    private List<QuizDto> quizzes;
    private Boolean completed = false;

    @Getter
    @Setter
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

        public static MaterialDto from(Material m) {
            MaterialDto dto = new MaterialDto();
            dto.setId(m.getId());
            dto.setTitle(m.getTitle());
            dto.setDescription(m.getDescription());
            dto.setType(m.getType());
            dto.setFileUrl(m.getFileUrl());
            dto.setFileSize(m.getFileSize());
            dto.setDisplayOrder(m.getDisplayOrder());
            dto.setIsRequired(m.getIsRequired());
            dto.setIsDownloadable(m.getIsDownloadable());
            return dto;
        }
    }

    @Getter
    @Setter
    public static class QuizDto {
        private Integer id;
        private String title;
        private String description;
        private String quizType;
        private Integer totalQuestions;
        private Integer durationMinutes;
        private Integer maxAttempts;
        private Integer passingScore;

        public static QuizDto from(Quiz quiz) {
            QuizDto dto = new QuizDto();
            dto.setId(quiz.getId());
            dto.setTitle(quiz.getTitle());
            dto.setDescription(quiz.getDescription());
            dto.setQuizType(quiz.getQuizType());
            dto.setTotalQuestions(quiz.getTotalQuestions());
            dto.setDurationMinutes(quiz.getDurationMinutes());
            dto.setMaxAttempts(quiz.getMaxAttempts());
            dto.setPassingScore(quiz.getPassingScore() != null ? quiz.getPassingScore().intValue() : 0);
            return dto;
        }
    }

    public static CourseModuleDto from(CourseModule module) {
        return from(module, null);
    }

    public static CourseModuleDto from(CourseModule module, List<Quiz> quizzes) {
        CourseModuleDto dto = new CourseModuleDto();
        dto.setId(module.getId());
        dto.setTitle(module.getTitle());
        dto.setDescription(module.getDescription());
        dto.setDisplayOrder(module.getDisplayOrder());
        dto.setCompleted(false); // Default - can be updated based on enrollment progress
        dto.setMaterials(
            module.getMaterials() == null ? List.of() :
            module.getMaterials().stream().map(MaterialDto::from).collect(Collectors.toList())
        );
        // Set quizzes if provided
        if (quizzes != null && !quizzes.isEmpty()) {
            dto.setQuizzes(quizzes.stream().map(QuizDto::from).collect(Collectors.toList()));
        } else {
            dto.setQuizzes(List.of());
        }
        return dto;
    }
}
