package com.itms.dto;

import com.itms.common.LocationType;
import com.itms.common.SessionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateSessionRequest {
    
    @NotNull(message = "Course ID is required")
    private Integer courseId;
    
    @NotBlank(message = "Session name is required")
    private String sessionName;
    
    private Integer sessionNumber;
    
    @NotNull(message = "Date is required")
    private LocalDate date;
    
    @NotNull(message = "Start time is required")
    private LocalTime timeStart;
    
    @NotNull(message = "End time is required")
    private LocalTime timeEnd;
    
    @NotBlank(message = "Location is required")
    private String location;
    
    @NotNull(message = "Location type is required")
    private LocationType locationType;
    
    private String meetingLink;
    private String meetingPassword;
    
    @NotNull(message = "Max capacity is required")
    @Positive(message = "Max capacity must be positive")
    private Integer maxCapacity;
    
    private SessionStatus status = SessionStatus.SCHEDULED;
    private String notes;
}