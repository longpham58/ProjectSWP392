package com.itms.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CourseScheduleDto {

    private Long id;
    private Integer courseId;
    private String title;
    private String date;
    private String time;
    private Integer slot; // 1 = 7-9, 2 = 9-11, 3 = 11-13, 4 = 13-15, 5 = 15-17, 6 = 17-19
    private String location;
    private String instructor;
    private String status; // SCHEDULED, ONGOING, COMPLETED, CANCELLED
    private Integer dayOfWeek; // 0 = Sunday, 1 = Monday, etc.

    /**
     * Map from Session entity to DTO
     */
    public static CourseScheduleDto fromEntity(com.itms.entity.Session session) {
        // Calculate slot based on time start
        Integer slot = calculateSlot(session.getTimeStart());
        
        // Calculate day of week (0 = Sunday, 1 = Monday, etc.)
        Integer dayOfWeek = session.getDate().getDayOfWeek().getValue() % 7;
        
        // Map status (use uppercase to match database enum: SCHEDULED, ONGOING, COMPLETED, CANCELLED)
        String status = session.getStatus() != null ? 
            session.getStatus().name() : "SCHEDULED";
        
<<<<<<< HEAD
=======
        // Format title as "{courseCode}-Session{id}" (e.g., "ITMS001-Session1")
        String courseCode = session.getCourse() != null && session.getCourse().getCode() != null ?
            session.getCourse().getCode() : "COURSE";
        String title = courseCode + "-Session" + session.getId();
>>>>>>> 18dda540e61fd652941508eb561615ece98277b4

        return CourseScheduleDto.builder()
                .id(session.getId())
                .courseId(session.getCourse().getId())
<<<<<<< HEAD
                .title(session.getClass().getName())
=======
                .sessionNumber(session.getId().intValue()) // Use session ID as session number
                .title(title)
>>>>>>> 18dda540e61fd652941508eb561615ece98277b4
                .date(session.getDate() != null ? session.getDate().toString() : null)
                .time(session.getTimeStart() != null ? session.getTimeStart().toString() : null)
                .slot(slot)
                .location(session.getLocation())
                .instructor(session.getCourse().getTrainer() != null ? 
                    session.getCourse().getTrainer().getFullName() : null)
                .status(status)
                .dayOfWeek(dayOfWeek)
                .build();
    }

    /**
     * Calculate slot based on time
     * 1 = 7-9, 2 = 9-11, 3 = 11-13, 4 = 13-15, 5 = 15-17, 6 = 17-19
     */
    private static Integer calculateSlot(LocalTime timeStart) {
        if (timeStart == null) return 1;
        
        int hour = timeStart.getHour();
        if (hour >= 7 && hour < 9) return 1;
        if (hour >= 9 && hour < 11) return 2;
        if (hour >= 11 && hour < 13) return 3;
        if (hour >= 13 && hour < 15) return 4;
        if (hour >= 15 && hour < 17) return 5;
        if (hour >= 17 && hour < 19) return 6;
        return 1;
    }
}
