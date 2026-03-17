package com.itms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HrClassDto {
    private Integer id;
    private String classCode;
    private String className;
    private Integer courseId;
    private String courseName;
    private String courseCode;
    private Integer trainerId;
    private String trainerName;
    private Integer maxStudents;
    private String status;
    private String notes;
}
