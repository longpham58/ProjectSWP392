package com.itms.dto;

import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseCompletionDto {

    private Integer courseId;
    private String courseCode;
    private String courseName;
    private String courseCategory;
    private LocalDate endDate;
    private String status;
    private int totalStudents;
    private int eligibleStudents;   // students who met passing criteria
    private int alreadyCertified;   // already have certificate
    private List<StudentCompletionDto> students;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StudentCompletionDto {
        private Integer userId;
        private String username;
        private String fullName;
        private String email;
        private int attendedSessions;
        private int totalSessions;
        private double attendanceRate;
        private boolean eligible;       // met passing threshold
        private boolean hasCertificate; // already issued
    }
}
