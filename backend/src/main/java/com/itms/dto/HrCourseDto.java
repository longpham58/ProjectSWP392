package com.itms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HrCourseDto {
    private Integer id;
    private String code;
    private String name;
    private String category;
    private String description;
    private String status;
    private String trainerUsername;
    private String trainerName;
    private String departmentName;
}

