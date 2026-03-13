package com.itms.dto;

import com.itms.common.LocationType;
import com.itms.common.SessionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainerScheduleDto {
    private Long id;
    private Integer sessionNumber;
    private LocalDate date;
    private LocalTime timeStart;
    private LocalTime timeEnd;
    private String location;
    private LocationType locationType;
    private String meetingLink;
    private SessionStatus status;
    
    // Course info
    private Integer courseId;
    private String courseCode;
    private String courseName;
    
    // Capacity
    private Integer maxCapacity;
    private Integer currentEnrolled;
    
    // Computed fields for frontend
    private Integer dayOfWeek; // 0-6 (Sunday-Saturday)
    private Integer slot; // 1-11
}
