package com.itms.dto;

import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CertificateDto {

    private Integer id;
    private Integer courseId;
    private String courseName;
    private String studentName;
    private LocalDate completionDate;
    private String grade;
    private String instructor;
    private String certificateUrl;
}