package com.itms.controller;

import com.itms.dto.common.ResponseDto;
import com.itms.security.CustomUserDetails;
import com.itms.service.LearningStreakService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/streak")
public class LearningStreakController {

    @Autowired
    private LearningStreakService streakService;

    @GetMapping("/my")
    public ResponseEntity<ResponseDto<Integer>> getMyLearningStreak(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Integer userId = userDetails.getUser().getId();

        int streak = streakService.getCurrentStreak(userId);

        return ResponseEntity.ok(ResponseDto.success(streak,"Retrieved streak successsfully"));
    }
}