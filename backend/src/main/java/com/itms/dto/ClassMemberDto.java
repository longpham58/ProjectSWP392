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
public class ClassMemberDto {
    private Integer id;
    private Integer classId;
    private String classCode;
    private Integer userId;
    private String username;
    private String fullName;
    private String email;
    private String status;
    private LocalDateTime joinedAt;
    private String notes;
}
