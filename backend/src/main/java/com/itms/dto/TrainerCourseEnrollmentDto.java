package com.itms.dto;

import com.itms.common.EnrollmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainerCourseEnrollmentDto {
    private Integer enrollmentId;
    private Integer userId;
    private String username;
    private String fullName;
    private String email;
    private EnrollmentStatus status;
    private LocalDateTime registeredAt;
}
