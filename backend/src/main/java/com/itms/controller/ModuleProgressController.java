package com.itms.controller;

import com.itms.dto.ModuleProgressDto;
import com.itms.dto.common.ResponseDto;
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
    public ResponseEntity<ResponseDto<List<ModuleProgressDto>>> getModuleProgress(
            @PathVariable("userId") Integer userId,
            @PathVariable("courseId") Integer courseId) {
        List<ModuleProgressDto> progress = moduleProgressService.getModuleProgressByCourse(userId, courseId);
        return ResponseEntity.ok(ResponseDto.success(progress, "Module progress retrieved successfully"));
    }

    /**
     * Mark a module as completed
     */
    @PostMapping("/complete")
    public ResponseEntity<ResponseDto<ModuleProgressDto>> completeModule(@RequestBody Map<String, Integer> request) {
        Integer userId = request.get("userId");
        Integer moduleId = request.get("moduleId");

        ModuleProgressDto progress = moduleProgressService.completeModule(userId, moduleId);
        return ResponseEntity.ok(ResponseDto.success(progress, "Complete module"));
    }

    /**
     * Update module progress percentage
     */
    @PutMapping("/update")
    public ResponseEntity<ResponseDto<ModuleProgressDto>> updateProgress(@RequestBody Map<String, Object> request) {
        Integer userId = (Integer) request.get("userId");
        Integer moduleId = (Integer) request.get("moduleId");
        java.math.BigDecimal percentage = new java.math.BigDecimal(request.get("percentage").toString());

        ModuleProgressDto progress = moduleProgressService.updateProgress(userId, moduleId, percentage);
        return ResponseEntity.ok(ResponseDto.success(progress, "update module"));
    }

    /**
     * Check if a specific module is completed
     */
    @GetMapping("/check/{userId}/{moduleId}")
    public ResponseEntity<Map<String, Boolean>> isModuleCompleted(
            @PathVariable("userId") Integer userId,
            @PathVariable("moduleId") Integer moduleId) {
        boolean completed = moduleProgressService.isModuleCompleted(userId, moduleId);
        return ResponseEntity.ok(Map.of("isCompleted", completed));
    }

    /**
     * Get count of completed modules
     */
    @GetMapping("/count/{userId}/{courseId}")
    public ResponseEntity<Map<String, Integer>> getCompletedModulesCount(
            @PathVariable("userId") Integer userId,
            @PathVariable("courseId") Integer courseId) {
        int count = moduleProgressService.getCompletedModulesCount(userId, courseId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * Check if a quiz is unlocked
     */
    @GetMapping("/quiz-unlocked/{userId}/{moduleId}")
    public ResponseEntity<Map<String, Boolean>> isQuizUnlocked(
            @PathVariable("userId") Integer userId,
            @PathVariable("moduleId") Integer moduleId) {
        boolean unlocked = moduleProgressService.isQuizUnlocked(userId, moduleId);
        return ResponseEntity.ok(Map.of("unlocked", unlocked));
    }

    /**
     * Check if final exam is unlocked
     */
    @GetMapping("/final-exam-unlocked/{userId}/{courseId}")
    public ResponseEntity<Map<String, Boolean>> isFinalExamUnlocked(
            @PathVariable("userId") Integer userId,
            @PathVariable("courseId") Integer courseId) {
        // Default: require 2/3 tests passed
        boolean unlocked = moduleProgressService.isFinalExamUnlocked(userId, courseId, 2);
        return ResponseEntity.ok(Map.of("unlocked", unlocked));
    }

    /**
     * Get overall course progress percentage for a user
     */
    @GetMapping("/course-progress/{userId}/{courseId}")
    public ResponseEntity<ResponseDto<Map<String, Object>>> getCourseProgress(
            @PathVariable("userId") Integer userId,
            @PathVariable("courseId") Integer courseId) {
        Map<String, Object> progress = moduleProgressService.getCourseProgress(userId, courseId);
        return ResponseEntity.ok(ResponseDto.success(progress, "Course progress retrieved successfully"));
    }
}
