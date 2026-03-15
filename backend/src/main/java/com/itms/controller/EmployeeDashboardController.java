package com.itms.controller;

import com.itms.dto.DeadlineDto;
import com.itms.dto.EmployeeClassDto;
import com.itms.dto.RecentActivityDto;
import com.itms.dto.TodayProgressDto;
import com.itms.dto.UserProfileStatsDto;
import com.itms.dto.common.ResponseDto;
import com.itms.security.CustomUserDetails;
import com.itms.service.ClassRoomService;
import com.itms.service.EmployeeDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("api/employee/dashboard")
@RequiredArgsConstructor
public class EmployeeDashboardController {

    private final EmployeeDashboardService dashboardService;
    private final ClassRoomService classRoomService;
    // 2️⃣ Upcoming deadlines
    @GetMapping("/deadlines")
    public ResponseEntity<ResponseDto<List<DeadlineDto>>> getDeadlines(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Integer userId = userDetails.getUser().getId();

        List<DeadlineDto> deadlines = dashboardService.getDeadlines(userId);

        return ResponseEntity.ok(ResponseDto.success(deadlines, "Deadlines loaded"));
    }

    // 3️⃣ Recent activities
    @GetMapping("/recent-activities")
    public ResponseEntity<ResponseDto<List<RecentActivityDto>>> getRecentActivities(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Integer userId = userDetails.getUser().getId();

        List<RecentActivityDto> activities = dashboardService.getRecentActivities(userId);

        return ResponseEntity.ok(ResponseDto.success(activities, "Recent activities loaded"));
    }

    // 4️⃣ Today's progress
    @GetMapping("/today-progress")
    public ResponseEntity<ResponseDto<TodayProgressDto>> getTodayProgress(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Integer userId = userDetails.getUser().getId();

        TodayProgressDto progress = dashboardService.getTodayProgress(userId);

        return ResponseEntity.ok(ResponseDto.success(progress, "Today's progress loaded"));
    }

    // 5️⃣ Profile stats
    @GetMapping("/profile-stats")
    public ResponseEntity<ResponseDto<UserProfileStatsDto>> getProfileStats(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Integer userId = userDetails.getUser().getId();

        UserProfileStatsDto stats = dashboardService.getProfileStats(userId);

        return ResponseEntity.ok(ResponseDto.success(stats, "Profile stats loaded"));
    }
    
    // 6️⃣ My Classes - Get classes the employee is enrolled in
    @GetMapping("/classes")
    public ResponseEntity<ResponseDto<List<EmployeeClassDto>>> getMyClasses(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Integer userId = userDetails.getUser().getId();

        List<EmployeeClassDto> classes = classRoomService.getClassesByUserId(userId);

        return ResponseEntity.ok(ResponseDto.success(classes, "My classes loaded"));
    }

}
