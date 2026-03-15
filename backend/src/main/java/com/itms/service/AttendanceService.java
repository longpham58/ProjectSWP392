package com.itms.service;

import com.itms.controller.TrainerController;
import com.itms.dto.SessionAttendanceDto;
import com.itms.entity.CourseModule;
import com.itms.repository.AttendanceRepository;
import com.itms.repository.CourseModuleRepository;
import com.itms.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final SessionRepository sessionRepository;
    private final AttendanceRepository attendanceRepository;
    private final CourseModuleRepository courseModuleRepository;

    /**
     * Get all sessions with attendance status for a user in a course
     * Uses a single query with JOINs for better performance
     */
    public List<SessionAttendanceDto> getSessionAttendanceForUser(Integer userId, Integer courseId) {
        // Get sessions with attendance using efficient single query
        List<SessionAttendanceDto> results = sessionRepository.getSessionAttendanceForUser(userId, courseId);
        
        // Calculate progress info
        int totalSessions = results.size();
        int attendedSessions = (int) results.stream()
                .filter(s -> Boolean.TRUE.equals(s.getAttended()))
                .count();
        
        // Set progress info for each session
        for (SessionAttendanceDto dto : results) {
            dto.setTotalSessions(totalSessions);
            dto.setAttendedSessions(attendedSessions);
            dto.setRemainingSessions(totalSessions - attendedSessions);
            
            // Set default values if null
            if (dto.getAttended() == null) {
                dto.setAttended(false);
            }
            if (dto.getCompletionStatus() == null) {
                dto.setCompletionStatus("NOT_MARKED");
                dto.setMarkedComplete(false);
            }
        }
        
        return results;
    }

    /**
     * Get attendance summary for a user in a course
     */
    public SessionAttendanceDto getAttendanceSummary(Integer userId, Integer courseId) {
        List<SessionAttendanceDto> sessions = getSessionAttendanceForUser(userId, courseId);
        
        SessionAttendanceDto summary = new SessionAttendanceDto();
        summary.setTotalSessions(sessions.size());
        summary.setAttendedSessions((int) sessions.stream().filter(s -> Boolean.TRUE.equals(s.getAttended())).count());
        summary.setRemainingSessions((int) sessions.stream().filter(s -> !Boolean.TRUE.equals(s.getAttended())).count());
        
        return summary;
    }

    /**
     * Get attendance for a specific session (for trainers)
     */
    public List<SessionAttendanceDto> getSessionAttendance(Long sessionId) {
        return sessionRepository.getSessionAttendanceForSession(sessionId);
    }

    /**
     * Update attendance for students in a session (for trainers)
     */
    public void updateAttendance(Long sessionId, List<TrainerController.AttendanceUpdateRequest> attendanceUpdates) {
        for (TrainerController.AttendanceUpdateRequest update : attendanceUpdates) {
            attendanceRepository.updateAttendanceForUserAndSession(
                update.getStudentId(), 
                sessionId.intValue(), 
                update.getAttended(),
                update.getNotes()
            );
        }
    }
}
