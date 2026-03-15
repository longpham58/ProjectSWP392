package com.itms.dto;

import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassAttendanceDto {

    private String classCode;
    private String className;
    private LocalDate date;
    private List<StudentAttendanceDto> students;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StudentAttendanceDto {
        private Integer userId;
        private String fullName;
        private String email;
        private Boolean attended;
        private String notes;
    }
}
