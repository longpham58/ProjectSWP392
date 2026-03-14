package com.itms.controller;

import com.itms.dto.SessionAttendanceDto;
import com.itms.dto.common.ResponseDto;
import com.itms.security.CustomUserDetails;
import com.itms.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    /**
     * Get all sessions with attendance status for the current user in a course
     */
    @GetMapping("/course/{courseId}")
    public ResponseEntity<ResponseDto<List<SessionAttendanceDto>>> getSessionAttendance(
            @PathVariable Integer courseId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        Integer userId = userDetails.getId();
        List<SessionAttendanceDto> sessions = attendanceService.getSessionAttendanceForUser(userId, courseId);
        
        return ResponseEntity.ok(
                ResponseDto.success(sessions, "Lấy thông tin điểm danh thành công")
        );
    }

    /**
     * Get attendance summary for the current user in a course
     */
    @GetMapping("/course/{courseId}/summary")
    public ResponseEntity<ResponseDto<SessionAttendanceDto>> getAttendanceSummary(
            @PathVariable Integer courseId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        Integer userId = userDetails.getId();
        SessionAttendanceDto summary = attendanceService.getAttendanceSummary(userId, courseId);
        
        return ResponseEntity.ok(
                ResponseDto.success(summary,"Lấy tổng điểm danh thành công")
        );
    }
}
