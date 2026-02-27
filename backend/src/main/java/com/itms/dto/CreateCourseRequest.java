package com.itms.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateCourseRequest {
    
    @NotBlank(message = "Mã khóa học không được để trống")
    @Size(max = 20, message = "Mã khóa học không được quá 20 ký tự")
    private String code;
    
    @NotBlank(message = "Tên khóa học không được để trống")
    @Size(max = 255, message = "Tên khóa học không được quá 255 ký tự")
    private String name;
    
    private String description;
    
    private String objectives;
    
    private String prerequisites;
    
    @NotNull(message = "Thời lượng không được để trống")
    @DecimalMin(value = "0.5", message = "Thời lượng phải ít nhất 0.5 giờ")
    private BigDecimal durationHours;
    
    @NotBlank(message = "Danh mục không được để trống")
    private String category;
    
    @NotBlank(message = "Cấp độ không được để trống")
    @Pattern(regexp = "BEGINNER|INTERMEDIATE|ADVANCED", message = "Cấp độ phải là BEGINNER, INTERMEDIATE hoặc ADVANCED")
    private String level;
    
    private String thumbnailUrl;
    
    @DecimalMin(value = "0", message = "Điểm đạt phải từ 0")
    @DecimalMax(value = "100", message = "Điểm đạt không được quá 100")
    private BigDecimal passingScore;
    
    @Min(value = 1, message = "Số lần thử phải ít nhất 1")
    private Integer maxAttempts;
    
    @NotNull(message = "Trainer ID không được để trống")
    private Integer trainerId;
}
