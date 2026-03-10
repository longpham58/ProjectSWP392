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
    private String sessionName;
    private Integer sessionNumber;
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
