package com.itms.controller;

import com.itms.dto.ModuleProgressDto;
import com.itms.service.ModuleProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/module-progress")
@RequiredArgsConstructor
public class ModuleProgressController {

    private final ModuleProgressService moduleProgressService;

    /**
     * Get all module progress for a user in a specific course
     */
    @GetMapping("/user/{userId}/course/{courseId}")
    public ResponseEntity<List<ModuleProgressDto>> getModuleProgress(
            @PathVariable Integer userId,
            @PathVariable Integer courseId) {
        List<ModuleProgressDto> progress = moduleProgressService.getModuleProgressByCourse(userId, courseId);
        return ResponseEntity.ok(progress);
    }

    /**
     * Mark a module as completed
     */
    @PostMapping("/complete")
    public ResponseEntity<ModuleProgressDto> completeModule(@RequestBody Map<String, Integer> request) {
        Integer userId = request.get("userId");
        Integer moduleId = request.get("moduleId");
        
        ModuleProgressDto progress = moduleProgressService.completeModule(userId, moduleId);
        return ResponseEntity.ok(progress);
    }

    /**
     * Update module progress percentage
     */
    @PutMapping("/update")
    public ResponseEntity<ModuleProgressDto> updateProgress(@RequestBody Map<String, Object> request) {
        Integer userId = (Integer) request.get("userId");
        Integer moduleId = (Integer) request.get("moduleId");
        java.math.BigDecimal percentage = new java.math.BigDecimal(request.get("percentage").toString());
        
        ModuleProgressDto progress = moduleProgressService.updateProgress(userId, moduleId, percentage);
        return ResponseEntity.ok(progress);
    }

    /**
     * Check if a specific module is completed
     */
    @GetMapping("/check/{userId}/{moduleId}")
    public ResponseEntity<Map<String, Boolean>> isModuleCompleted(
            @PathVariable Integer userId,
            @PathVariable Integer moduleId) {
        boolean completed = moduleProgressService.isModuleCompleted(userId, moduleId);
        return ResponseEntity.ok(Map.of("isCompleted", completed));
    }

    /**
     * Get count of completed modules
     */
    @GetMapping("/count/{userId}/{courseId}")
    public ResponseEntity<Map<String, Integer>> getCompletedModulesCount(
            @PathVariable Integer userId,
            @PathVariable Integer courseId) {
        int count = moduleProgressService.getCompletedModulesCount(userId, courseId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * Check if a quiz is unlocked
     */
    @GetMapping("/quiz-unlocked/{userId}/{moduleId}")
    public ResponseEntity<Map<String, Boolean>> isQuizUnlocked(
            @PathVariable Integer userId,
            @PathVariable Integer moduleId) {
        boolean unlocked = moduleProgressService.isQuizUnlocked(userId, moduleId);
        return ResponseEntity.ok(Map.of("unlocked", unlocked));
    }

    /**
     * Check if final exam is unlocked
     */
    @GetMapping("/final-exam-unlocked/{userId}/{courseId}")
    public ResponseEntity<Map<String, Boolean>> isFinalExamUnlocked(
            @PathVariable Integer userId,
            @PathVariable Integer courseId) {
        // Default: require 2/3 tests passed
        boolean unlocked = moduleProgressService.isFinalExamUnlocked(userId, courseId, 2);
        return ResponseEntity.ok(Map.of("unlocked", unlocked));
    }
}
