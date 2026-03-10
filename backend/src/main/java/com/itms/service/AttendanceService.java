package com.itms.service;

import com.itms.dto.SessionAttendanceDto;
import com.itms.entity.Attendance;
import com.itms.entity.CourseModule;
import com.itms.entity.Enrollment;
import com.itms.entity.Session;
import com.itms.repository.AttendanceRepository;
import com.itms.repository.CourseModuleRepository;
import com.itms.repository.EnrollmentRepository;
import com.itms.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final SessionRepository sessionRepository;
    private final AttendanceRepository attendanceRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CourseModuleRepository courseModuleRepository;

    /**
     * Get all sessions with attendance status for a user in a course
     */
    public List<SessionAttendanceDto> getSessionAttendanceForUser(Integer userId, Integer courseId) {
        // Get all sessions for the course
        List<Session> sessions = sessionRepository.findByCourseIdOrderByDateAsc(courseId);
        
        // Get enrollments for this user in this course
        List<Enrollment> enrollments = enrollmentRepository.findByUserIdAndCourseId(userId, courseId);
        
        // Get attendances for this user in this course
        List<Attendance> attendances = attendanceRepository.findByUserIdAndCourseId(userId, courseId);
        
        // Create a map of sessionId -> attendance
        Map<Long, Attendance> attendanceMap = attendances.stream()
                .collect(Collectors.toMap(
                        a -> a.getEnrollment().getSession().getId(),
                        a -> a,
                        (a1, a2) -> a1
                ));
        
        // Get total sessions count
        int totalSessions = sessions.size();
        
        // Get attended sessions count
        int attendedSessions = (int) attendances.stream()
                .filter(a -> Boolean.TRUE.equals(a.getAttended()))
                .count();
        
        // Build the response
        List<SessionAttendanceDto> result = new ArrayList<>();
        
        for (Session session : sessions) {
            SessionAttendanceDto dto = new SessionAttendanceDto();
            dto.setSessionId(session.getId());
            dto.setSessionName(session.getSessionName());
            dto.setSessionNumber(session.getSessionNumber());
            dto.setDate(session.getDate());
            dto.setTimeStart(session.getTimeStart());
            dto.setTimeEnd(session.getTimeEnd());
            dto.setLocation(session.getLocation());
            dto.setStatus(session.getStatus());
            
            // Set attendance info
            Attendance attendance = attendanceMap.get(session.getId());
            if (attendance != null) {
                dto.setAttended(attendance.getAttended());
                dto.setMarkedComplete("COMPLETED".equals(attendance.getCompletionStatus()));
                dto.setMarkedBy(attendance.getMarkedBy() != null ? 
                        attendance.getMarkedBy().getFullName() : null);
                dto.setCompletionStatus(attendance.getCompletionStatus());
            } else {
                dto.setAttended(false);
                dto.setMarkedComplete(false);
                dto.setMarkedBy(null);
                dto.setCompletionStatus("NOT_MARKED");
            }
            
            // Set progress info
            dto.setTotalSessions(totalSessions);
            dto.setAttendedSessions(attendedSessions);
            dto.setRemainingSessions(totalSessions - attendedSessions);
            
            result.add(dto);
        }
        
        return result;
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
}
