package com.itms.controller;

import com.itms.dto.FeedbackDto;
import com.itms.dto.common.ResponseDto;
import com.itms.service.FeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    /**
     * Get all feedback for a course
     */
    @GetMapping("/course/{courseId}")
    public ResponseEntity<ResponseDto<List<FeedbackDto>>> getCourseFeedback(@PathVariable Integer courseId) {
        List<FeedbackDto> feedbacks = feedbackService.getCourseFeedback(courseId);
        return ResponseEntity.ok(ResponseDto.success(feedbacks, "Feedback retrieved successfully"));
    }

    /**
     * Get user's feedback for a course
     */
    @GetMapping("/user/{userId}/course/{courseId}")
    public ResponseEntity<ResponseDto<FeedbackDto>> getUserFeedback(
            @PathVariable Integer userId,
            @PathVariable Integer courseId) {
        FeedbackDto feedback = feedbackService.getUserFeedback(userId, courseId);
        return ResponseEntity.ok(ResponseDto.success(feedback, "User feedback retrieved successfully"));
    }

    /**
     * Check if user has submitted feedback
     */
    @GetMapping("/user/{userId}/course/{courseId}/exists")
    public ResponseEntity<ResponseDto<Boolean>> hasUserSubmittedFeedback(
            @PathVariable Integer userId,
            @PathVariable Integer courseId) {
        boolean exists = feedbackService.hasUserSubmittedFeedback(userId, courseId);
        return ResponseEntity.ok(ResponseDto.success(exists, "Feedback status retrieved"));
    }

    /**
     * Submit feedback for a course
     */
    @PostMapping("/submit")
    public ResponseEntity<ResponseDto<FeedbackDto>> submitFeedback(@RequestBody FeedbackDto feedbackDto) {
        FeedbackDto feedback = feedbackService.submitFeedback(feedbackDto);
        return ResponseEntity.ok(ResponseDto.success(feedback, "Feedback submitted successfully"));
    }
}
