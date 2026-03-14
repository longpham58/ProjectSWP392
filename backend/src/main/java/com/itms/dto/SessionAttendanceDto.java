package com.itms.dto;

import com.itms.common.SessionStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Getter
@Setter
public class SessionAttendanceDto {
    
    private Long sessionId;
    private String courseCode;
    private LocalDate date;
    private LocalTime timeStart;
    private LocalTime timeEnd;
    private String location;
    private SessionStatus status;
    
    // Attendance info
    private Boolean attended;
    private Boolean markedComplete;
    private String markedBy;
    private String completionStatus;
    
    // Progress info
    private Integer totalSessions;
    private Integer attendedSessions;
    private Integer remainingSessions;
    
    // Materials in this session (optional - if session has linked modules)
    private List<ModuleMaterialDto> materials;
    
    // Constructor for JPQL query projection
    public SessionAttendanceDto(
            Long sessionId,
            String courseCode,
            LocalDate date,
            LocalTime timeStart,
            LocalTime timeEnd,
            String location,
            SessionStatus status,
            Boolean attended,
            String completionStatus,
            String markedBy
    ) {
        this.sessionId = sessionId;
        this.courseCode = courseCode;
        this.date = date;
        this.timeStart = timeStart;
        this.timeEnd = timeEnd;
        this.location = location;
        this.status = status;
        this.attended = attended;
        this.completionStatus = completionStatus;
        this.markedBy = markedBy;
        this.markedComplete = "COMPLETED".equals(completionStatus);
    }
    
    public SessionAttendanceDto() {}
    
    @Getter
    @Setter
    public static class ModuleMaterialDto {
        private Integer moduleId;
        private String moduleTitle;
        private List<MaterialInfo> materials;
    }
    
    @Getter
    @Setter
    public static class MaterialInfo {
        private Long materialId;
        private String title;
        private String type;
        private String fileUrl;
    }
}
