package com.itms.controller;

import com.itms.dto.CourseScheduleDto;
import com.itms.dto.common.ResponseDto;
import com.itms.security.CustomUserDetails;
import com.itms.service.SessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;

    /**
     * Get course schedule for the current user
     */
    @GetMapping("/schedule")
    public ResponseEntity<ResponseDto<List<CourseScheduleDto>>> getCourseSchedule(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        Integer userId = userDetails.getId();
        List<CourseScheduleDto> schedule = sessionService.getCourseSchedule(userId);
        
        return ResponseEntity.ok(
                ResponseDto.success(schedule, "Lấy lịch học thành công")
        );
    }

    /**
     * Get course schedule for a specific course
     */
    @GetMapping("/schedule/course/{courseId}")
    public ResponseEntity<ResponseDto<List<CourseScheduleDto>>> getCourseScheduleByCourse(
            @PathVariable Integer courseId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        Integer userId = userDetails.getId();
        List<CourseScheduleDto> schedule = sessionService.getCourseScheduleByCourse(userId, courseId);
        
        return ResponseEntity.ok(
                ResponseDto.success(schedule, "Lấy lịch học thành công")
        );
    }
}
