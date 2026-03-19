package com.itms.controller;

import com.itms.dto.FeedbackDto;
import com.itms.dto.common.ResponseDto;
import com.itms.security.CustomUserDetails;
import com.itms.service.FeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hr/feedback")
@RequiredArgsConstructor
public class HrFeedbackController {

    private final FeedbackService feedbackService;

    /**
     * Get all reports from trainers
     */
    @GetMapping("/reports")
    public ResponseEntity<ResponseDto<List<FeedbackDto>>> getReports() {
        List<FeedbackDto> reports = feedbackService.getReportsForHr();
        return ResponseEntity.ok(ResponseDto.success(reports, "Lấy danh sách báo cáo vi phạm thành công"));
    }

    /**
     * Mark a report as resolved
     */
    @PutMapping("/{id}/resolve")
    public ResponseEntity<ResponseDto<String>> resolveReport(@PathVariable("id") Long id) {
        feedbackService.resolveFeedback(id);
        return ResponseEntity.ok(ResponseDto.success("", "Đã xử lý báo cáo vi phạm"));
    }

    /**
     * Send feedback/report to Admin
     */
    @PostMapping("/to-admin")
    public ResponseEntity<ResponseDto<FeedbackDto>> sendToAdmin(
            @RequestBody FeedbackDto feedbackDto,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        feedbackDto.setUserId(userDetails.getId());
        FeedbackDto saved = feedbackService.submitHrToAdminFeedback(feedbackDto);
        return ResponseEntity.ok(ResponseDto.success(saved, "Gửi báo cáo cho Admin thành công"));
    }
}
