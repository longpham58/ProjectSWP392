package com.itms.dto;

<<<<<<< HEAD
=======
import com.itms.common.LocationType;
>>>>>>> origin/main
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
<<<<<<< HEAD
=======
    private String sessionName;
    private Integer sessionNumber;
>>>>>>> origin/main
    private LocalDate date;
    private LocalTime timeStart;
    private LocalTime timeEnd;
    private String location;
<<<<<<< HEAD
=======
    private LocationType locationType;
>>>>>>> origin/main
    private SessionStatus status;
    private String meetingLink;
    
    // Course info
    private Integer courseId;
    private String courseCode;
    private String courseName;
    
<<<<<<< HEAD
=======
    // Class info
    private String classCode;
    
    // Trainer info
    private String trainerName;
    
    // Capacity
    private Integer maxCapacity;
    private Integer currentEnrolled;
    
>>>>>>> origin/main
    // Day of week (0 = Sunday, 1 = Monday, etc.)
    private Integer dayOfWeek;
}
