package com.itms.controller;

import com.itms.service.LearningStreakService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/streak")
public class LearningStreakController {

    @Autowired
    private LearningStreakService streakService;

    @GetMapping("/{userId}")
    public int getLearningStreak(@PathVariable Integer userId) {
        return streakService.getCurrentStreak(userId);
    }
}