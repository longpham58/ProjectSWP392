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
    private Long sessionId;
    private String sessionName;
    private Integer sessionNumber;
    private LocalDate date;
    private LocalTime timeStart;
    private LocalTime timeEnd;
    private String location;
    private LocationType locationType;
    private SessionStatus status;
    private String meetingLink;
    
    // Course info
    private Integer courseId;
    private String courseCode;
    private String courseName;
    
    // Class info
    private String classCode;
    
    // Trainer info
    private String trainerName;
    
    // Capacity
    private Integer maxCapacity;
    private Integer currentEnrolled;
    
    // Day of week (0 = Sunday, 1 = Monday, etc.)
    private Integer dayOfWeek;
}
