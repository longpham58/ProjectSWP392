package com.itms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HrScheduleDto {
    private Long id;
    private String trainerUsername;
    private String courseCode;
    private String courseName;
    private String classCode;
    private String date;
    private String startTime;
    private String endTime;
    private String room;
    private String locationType;
    private String meetingLink;
    private String meetingPassword;
    private Integer maxCapacity;
    private Integer currentEnrolled;
    private String status;
    private String notes;
}
