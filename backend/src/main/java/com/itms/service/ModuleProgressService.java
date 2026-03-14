package com.itms.service;

import com.itms.dto.ModuleProgressDto;
import com.itms.entity.CourseModule;
import com.itms.entity.User;
import com.itms.entity.UserModuleProgress;
import com.itms.repository.CourseModuleRepository;
import com.itms.repository.UserModuleProgressRepository;
import com.itms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ModuleProgressService {

    private final UserModuleProgressRepository progressRepository;
    private final CourseModuleRepository moduleRepository;
    private final UserRepository userRepository;

    /**
     * Get overall course progress for a user
     * Calculates: (completed modules / total modules) * 100
     */
    public Map<String, Object> getCourseProgress(Integer userId, Integer courseId) {
        // Get total modules in the course
        List<CourseModule> courseModules = moduleRepository.findByCourseId(courseId);
        int totalModules = courseModules.size();
        
        // Get completed modules count for this user in this course
        int completedModules = progressRepository.countCompletedModules(userId, courseId);
        
        // Calculate progress percentage
        double progressPercentage = totalModules > 0 
            ? (completedModules * 100.0) / totalModules 
            : 0.0;
        
        // Get all module progress details
        List<UserModuleProgress> allProgress = progressRepository.findByUserIdAndCourseId(userId, courseId);
        int totalTimeSpent = allProgress.stream()
            .mapToInt(p -> p.getTimeSpentMinutes() != null ? p.getTimeSpentMinutes() : 0)
            .sum();
        
        Map<String, Object> result = new HashMap<>();
        result.put("courseId", courseId);
        result.put("userId", userId);
        result.put("totalModules", totalModules);
        result.put("completedModules", completedModules);
        result.put("progressPercentage", Math.round(progressPercentage * 100.0) / 100.0);
        result.put("timeSpentMinutes", totalTimeSpent);
        
        return result;
    }

    /**
     * Get all module progress for a user in a specific course
     */
    public List<ModuleProgressDto> getModuleProgressByCourse(Integer userId, Integer courseId) {
        List<UserModuleProgress> progressList = progressRepository.findByUserIdAndCourseId(userId, courseId);
        
        return progressList.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Mark a module as completed
     */
    @Transactional
    public ModuleProgressDto completeModule(Integer userId, Integer moduleId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        CourseModule module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new RuntimeException("Module not found"));
        
        // Find existing progress or create new
        UserModuleProgress progress = progressRepository.findByUserIdAndModuleId(userId, moduleId)
                .orElse(UserModuleProgress.builder()
                        .user(user)
                        .module(module)
                        .timeSpentMinutes(0)
                        .build());
        
        progress.setIsCompleted(true);
        progress.setCompletedAt(LocalDateTime.now());
        progress.setLastAccessedAt(LocalDateTime.now());
        
        UserModuleProgress saved = progressRepository.save(progress);
        
        return mapToDto(saved);
    }

    /**
     * Update module progress (percentage)
     */
    @Transactional
    public ModuleProgressDto updateProgress(Integer userId, Integer moduleId, java.math.BigDecimal percentage) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        CourseModule module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new RuntimeException("Module not found"));
        
        UserModuleProgress progress = progressRepository.findByUserIdAndModuleId(userId, moduleId)
                .orElse(UserModuleProgress.builder()
                        .user(user)
                        .module(module)
                        .timeSpentMinutes(0)
                        .build());

        progress.setLastAccessedAt(LocalDateTime.now());
        
        // Auto-complete if 100%
        if (percentage.compareTo(java.math.BigDecimal.valueOf(100)) >= 0) {
            progress.setIsCompleted(true);
            progress.setCompletedAt(LocalDateTime.now());
        }
        
        UserModuleProgress saved = progressRepository.save(progress);
        
        return mapToDto(saved);
    }

    /**
     * Check if a specific module is completed
     */
    public boolean isModuleCompleted(Integer userId, Integer moduleId) {
        return progressRepository.isModuleCompleted(userId, moduleId);
    }

    /**
     * Get count of completed modules in a course
     */
    public int getCompletedModulesCount(Integer userId, Integer courseId) {
        return progressRepository.countCompletedModules(userId, courseId);
    }

    /**
     * Check if a quiz/test is unlocked based on module completion
     */
    public boolean isQuizUnlocked(Integer userId, Integer moduleId) {
        return isModuleCompleted(userId, moduleId);
    }

    /**
     * Check if final exam is unlocked (2/3 tests passed)
     * This would need to check QuizAttempt table for passed quizzes
     */
    public boolean isFinalExamUnlocked(Integer userId, Integer courseId, int requiredPassedTests) {
        int completedModules = getCompletedModulesCount(userId, courseId);
        // For now, require all modules to be completed for final exam
        // In a real implementation, this would check quiz attempts
        return completedModules >= requiredPassedTests;
    }

    private ModuleProgressDto mapToDto(UserModuleProgress progress) {
        return ModuleProgressDto.builder()
                .id(progress.getId())
                .userId(progress.getUser().getId())
                .moduleId(progress.getModule().getId())
                .moduleTitle(progress.getModule().getTitle())
                .courseId(progress.getModule().getCourse().getId())
                .courseName(progress.getModule().getCourse().getName())
                .enrollmentId(progress.getEnrollment() != null ? progress.getEnrollment().getId() : null)
                .isCompleted(progress.getIsCompleted())
                .completedAt(progress.getCompletedAt())
                .timeSpentMinutes(progress.getTimeSpentMinutes())
                .lastAccessedAt(progress.getLastAccessedAt())
                .createdAt(progress.getCreatedAt())
                .build();
    }
}
