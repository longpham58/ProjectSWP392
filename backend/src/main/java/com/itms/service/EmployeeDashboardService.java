package com.itms.service;

import com.itms.common.CompletionStatus;
import com.itms.common.EnrollmentStatus;
import com.itms.dto.DeadlineDto;
import com.itms.dto.RecentActivityDto;
import com.itms.dto.TodayProgressDto;
import com.itms.dto.UserProfileStatsDto;
import com.itms.repository.AttendanceRepository;
import com.itms.repository.CertificateRepository;
import com.itms.repository.EnrollmentRepository;
import com.itms.repository.QuizRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployeeDashboardService {

    private final QuizRepository quizRepository;
    private final AttendanceRepository attendanceRepository;
    private final CertificateRepository certificateRepository;
    private final EnrollmentRepository enrollmentRepository;

    // Fallback daily targets when no sessions are scheduled
    private static final int LESSONS_TARGET_FALLBACK = 0;
    private static final double STUDY_HOURS_TARGET_FALLBACK = 0.0;
    private static final int QUIZZES_TARGET_FALLBACK = 0;

    public List<DeadlineDto> getDeadlines(Integer userId) {

        List<Object[]> rows = quizRepository.findPendingQuizDeadlines(userId);
        List<DeadlineDto> deadlines = new ArrayList<>();

        for (Object[] row : rows) {
            DeadlineDto d = new DeadlineDto();
            d.setId(row[0] != null ? ((Number) row[0]).intValue() : null);
            d.setTitle((String) row[1]);
            d.setCourse((String) row[2]);
            d.setDueDate(row[3] != null ? (java.time.LocalDateTime) row[3] : null);
            d.setDaysLeft(row[4] != null ? ((Number) row[4]).intValue() : null);
            d.setType((String) row[5]);
            deadlines.add(d);
        }

        deadlines.forEach(d -> {

            // priority
            if (d.getDaysLeft() <= 3) d.setPriority("HIGH");
            else if (d.getDaysLeft() <= 7) d.setPriority("MEDIUM");
            else d.setPriority("LOW");

            // convert quiz type
            switch (d.getType()) {
                case "PRACTICE":
                    d.setType("QUIZ");
                    break;
                case "PRE_TEST":
                    d.setType("TEST");
                    break;
                case "POST_TEST":
                    d.setType("FINAL_EXAM");
                    break;
                default:
                    d.setType("QUIZ");
            }
        });

        return deadlines;
    }

    public List<RecentActivityDto> getRecentActivities(Integer userId) {
        List<RecentActivityDto> activities = new ArrayList<>();

        // Session attendance activities
        List<Object[]> sessionRows = attendanceRepository.findRecentSessionActivities(userId);
        for (Object[] row : sessionRows) {
            RecentActivityDto dto = new RecentActivityDto();
            dto.setId(row[0] != null ? ((Number) row[0]).intValue() : null);
            dto.setType((String) row[1]);
            dto.setTitle((String) row[2]);
            dto.setCourse((String) row[3]);
            dto.setTime(row[4] != null ? row[4].toString() : null);
            activities.add(dto);
        }

        // Quiz attempt activities
        List<Object[]> quizRows = quizRepository.findRecentQuizActivities(userId);
        for (Object[] row : quizRows) {
            RecentActivityDto dto = new RecentActivityDto();
            dto.setId(row[0] != null ? ((Number) row[0]).intValue() : null);
            dto.setType((String) row[1]);
            dto.setTitle((String) row[2]);
            dto.setCourse((String) row[3]);
            dto.setTime(row[4] != null ? row[4].toString() : null);
            activities.add(dto);
        }

        // Enrollment (new course join) activities
        List<Object[]> enrollRows = enrollmentRepository.findRecentEnrollmentActivities(userId);
        for (Object[] row : enrollRows) {
            RecentActivityDto dto = new RecentActivityDto();
            dto.setId(row[0] != null ? ((Number) row[0]).intValue() : null);
            dto.setType((String) row[1]);
            dto.setTitle((String) row[2]);
            dto.setCourse((String) row[3]);
            dto.setTime(row[4] != null ? row[4].toString() : null);
            activities.add(dto);
        }

        // Certificate received activities
        List<Object[]> certRows = certificateRepository.findRecentCertificateActivities(userId);
        for (Object[] row : certRows) {
            RecentActivityDto dto = new RecentActivityDto();
            dto.setId(row[0] != null ? ((Number) row[0]).intValue() : null);
            dto.setType((String) row[1]);
            dto.setTitle((String) row[2]);
            dto.setCourse((String) row[3]);
            dto.setTime(row[4] != null ? row[4].toString() : null);
            activities.add(dto);
        }

        // Sort combined list by time descending, return top 10
        activities.sort(Comparator.comparing(RecentActivityDto::getTime,
                Comparator.nullsLast(Comparator.reverseOrder())));
        
        List<RecentActivityDto> topActivities = activities.size() > 10 
                ? activities.subList(0, 10) 
                : activities;
        
        // Set icon and color for each activity
        for (RecentActivityDto activity : topActivities) {
            setActivityIconAndColor(activity);
        }
        
        return topActivities;
    }
    
    private void setActivityIconAndColor(RecentActivityDto activity) {
        String type = activity.getType();
        switch (type != null ? type.toUpperCase() : "LESSON") {
            case "QUIZ":
            case "QUIZ_COMPLETE":
                activity.setIcon("✅");
                activity.setColor("green");
                break;
            case "COURSE":
            case "ENROLLMENT":
            case "JOIN_COURSE":
                activity.setIcon("📚");
                activity.setColor("blue");
                break;
            case "CERTIFICATE":
            case "CERT_COMPLETE":
                activity.setIcon("🏆");
                activity.setColor("purple");
                break;
            case "LESSON":
            case "SESSION":
            case "ATTENDANCE":
            default:
                activity.setIcon("📖");
                activity.setColor("teal");
                break;
        }
    }

    public TodayProgressDto getTodayProgress(Integer userId) {
        TodayProgressDto dto = new TodayProgressDto();

        // --- Lessons ---
        // Completed = sessions attended today
        Integer sessionsAttended = attendanceRepository.countSessionsAttendedToday(userId);
        dto.setLessonsCompleted(sessionsAttended != null ? sessionsAttended : 0);

        // Target = sessions scheduled for the employee today (from enrolled courses)
        Integer scheduledSessions = enrollmentRepository.countScheduledSessionsToday(userId);
        int lessonsTarget = (scheduledSessions != null && scheduledSessions > 0)
                ? scheduledSessions : LESSONS_TARGET_FALLBACK;
        dto.setLessonsTarget(lessonsTarget);

        // --- Study Hours ---
        // Completed = total minutes attended today / 60
        Integer minutesAttended = attendanceRepository.sumStudyMinutesToday(userId);
        double hoursAttended = minutesAttended != null ? minutesAttended / 60.0 : 0.0;
        dto.setStudyHours(Math.round(hoursAttended * 10.0) / 10.0);

        // Target = total scheduled session duration today / 60
        Integer scheduledMinutes = enrollmentRepository.sumScheduledMinutesToday(userId);
        double hoursTarget = (scheduledMinutes != null && scheduledMinutes > 0)
                ? scheduledMinutes / 60.0 : STUDY_HOURS_TARGET_FALLBACK;
        dto.setStudyTarget(Math.round(hoursTarget * 10.0) / 10.0);

        // --- Quizzes ---
        // Completed = quizzes passed today
        Integer quizzesCompleted = quizRepository.countQuizzesPassedToday(userId);
        dto.setQuizzesCompleted(quizzesCompleted != null ? quizzesCompleted : 0);

        // Target = quizzes due today for the employee
        Integer quizzesDue = enrollmentRepository.countQuizzesDueToday(userId);
        int quizzesTarget = (quizzesDue != null && quizzesDue > 0)
                ? quizzesDue : QUIZZES_TARGET_FALLBACK;
        dto.setQuizzesTarget(quizzesTarget);

        return dto;
    }
    
    public UserProfileStatsDto getProfileStats(Integer userId) {
        UserProfileStatsDto dto = new UserProfileStatsDto();
        
        // Total courses (enrollments)
        Integer totalCourses = enrollmentRepository.countEnrollmentsByUserId(userId);
        dto.setTotalCourses(totalCourses != null ? totalCourses : 0);
        
        // Completed courses
        Integer completedCourses = enrollmentRepository.countCompletedEnrollmentsByUserId(userId);
        dto.setCompletedCourses(completedCourses != null ? completedCourses : 0);
        
        // Certificates
        Integer certificates = certificateRepository.countByUserId(userId);
        dto.setCertificates(certificates != null ? certificates : 0);
        
        // Average score - could be calculated from quiz attempts
        // For now, set a default value or calculate from quiz results
        Double averageScore = 0.0;
        dto.setAverageScore(averageScore);
        
        return dto;
    }
}
