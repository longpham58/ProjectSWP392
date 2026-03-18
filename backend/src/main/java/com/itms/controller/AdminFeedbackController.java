package com.itms.controller;

import com.itms.dto.FeedbackDto;
import com.itms.dto.common.ResponseDto;
import com.itms.security.CustomUserDetails;
import com.itms.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/feedback")
@RequiredArgsConstructor
public class AdminFeedbackController {

    private final AdminService adminService;

    /**
     * Get all system feedback (for admin and employees)
     * System feedback = where enrollment_id is NULL
     */
    @GetMapping("/system")
    public ResponseEntity<ResponseDto<java.util.List<FeedbackDto>>> getSystemFeedback() {
        java.util.List<FeedbackDto> feedbacks = adminService.getSystemFeedback();
        return ResponseEntity.ok(ResponseDto.success(feedbacks, "System feedback retrieved successfully"));
    }

    /**
     * Submit system feedback (for any authenticated user: admin, employee, trainer)
     * System feedback has enrollment_id = NULL
     */
    @PostMapping("/system")
    public ResponseEntity<ResponseDto<FeedbackDto>> submitSystemFeedback(
            @RequestBody FeedbackDto dto,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        FeedbackDto saved = adminService.submitSystemFeedback(dto, userDetails);
        return ResponseEntity.ok(ResponseDto.success(saved, "System feedback submitted successfully"));
    }

    /**
     * Delete feedback (for admin)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseDto<Void>> deleteFeedback(@PathVariable Long id) {
        adminService.deleteFeedback(id);
        return ResponseEntity.ok(ResponseDto.success(null, "Feedback deleted successfully"));
    }
}
