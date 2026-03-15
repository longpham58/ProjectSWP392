package com.itms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeClassDto {
    
    private Integer classId;
    private String classCode;
    private String className;
    private String courseName;
    private String courseCode;
    private String trainerName;
    private Integer maxStudents;
    private Integer currentStudents;
    private String status;
    private String notes;
    private LocalDateTime joinedAt;
}
