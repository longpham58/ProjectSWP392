package com.itms.controller;

import com.itms.dto.CertificateDto;
import com.itms.dto.CourseCompletionDto;
import com.itms.dto.common.ResponseDto;
import com.itms.security.CustomUserDetails;
import com.itms.service.CertificateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/certificates")
@RequiredArgsConstructor
public class CertificateController {

    private final CertificateService certificateService;

    /** Employee: get own certificates */
    @GetMapping("/user/{userId}")
    public ResponseEntity<ResponseDto<List<CertificateDto>>> getUserCertificates(@PathVariable Integer userId) {
        List<CertificateDto> certificates = certificateService.getCertificatesByUser(userId);
        return ResponseEntity.ok(ResponseDto.success(certificates, "My certificates retrieved successfully"));
    }

    /** HR: list all ended courses with student completion status */
    @GetMapping("/hr/completed-courses")
    @PreAuthorize("hasRole('HR') or hasRole('ADMIN')")
    public ResponseEntity<ResponseDto<List<CourseCompletionDto>>> getCompletedCourses() {
        List<CourseCompletionDto> result = certificateService.getCompletedCoursesForHr();
        return ResponseEntity.ok(ResponseDto.success(result, "Completed courses retrieved"));
    }

    /** HR: issue certificates to all eligible students of a course */
    @PostMapping("/hr/issue/{courseId}")
    @PreAuthorize("hasRole('HR') or hasRole('ADMIN')")
    public ResponseEntity<ResponseDto<Map<String, Integer>>> issueCertificates(
            @PathVariable Integer courseId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        int issued = certificateService.issueCertificatesForCourse(courseId, userDetails.getId());
        return ResponseEntity.ok(ResponseDto.success(Map.of("issued", issued),
                "Đã cấp " + issued + " chứng chỉ thành công"));
    }
}