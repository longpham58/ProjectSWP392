package com.itms.controller;

import com.itms.dto.CourseScheduleDto;
import com.itms.dto.common.ResponseDto;
import com.itms.entity.Session;
import com.itms.security.CustomUserDetails;
import com.itms.service.SessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;

    /**
     * Get sessions for the current user based on their class memberships
     */
    @GetMapping("/schedule")
    public ResponseEntity<ResponseDto<List<CourseScheduleDto>>> getCourseSchedule(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        Integer userId = userDetails.getId();
        List<Session> sessions = sessionService.getSessionsForUser(userId);
        
        List<CourseScheduleDto> schedule = sessions.stream()
                .map(CourseScheduleDto::fromEntity)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(
                ResponseDto.success(schedule, "Lấy lịch học thành công")
        );
    }

    /**
     * Get sessions for the current user filtered by course
     */
    @GetMapping("/schedule/course/{courseId}")
    public ResponseEntity<ResponseDto<List<CourseScheduleDto>>> getCourseScheduleByCourse(
            @PathVariable Integer courseId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        Integer userId = userDetails.getId();
        List<Session> sessions = sessionService.getSessionsForUser(userId);
        
        // Filter by courseId
        List<CourseScheduleDto> schedule = sessions.stream()
                .filter(s -> s.getCourse().getId().equals(courseId))
                .map(CourseScheduleDto::fromEntity)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(
                ResponseDto.success(schedule, "Lấy lịch học thành công")
        );
    }
}
