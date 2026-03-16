package com.itms.controller;

import com.itms.dto.HrNotificationDto;
import com.itms.dto.common.ResponseDto;
import com.itms.security.CustomUserDetails;
import com.itms.service.HrNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/hr/notifications")
@RequiredArgsConstructor
@PreAuthorize("hasRole('HR')")
public class HrNotificationController {

    private final HrNotificationService hrNotificationService;

    @GetMapping
    public ResponseEntity<ResponseDto<List<HrNotificationDto>>> getAll(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<HrNotificationDto> notifications = hrNotificationService.getAllBySender(userDetails.getId());
        return ResponseEntity.ok(ResponseDto.success(notifications, "HR notifications retrieved"));
    }

    @PostMapping
    public ResponseEntity<ResponseDto<HrNotificationDto>> create(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody HrNotificationDto request
    ) {
        HrNotificationDto created = hrNotificationService.create(userDetails.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ResponseDto.success(created, "Notification created"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResponseDto<HrNotificationDto>> update(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Integer id,
            @RequestBody HrNotificationDto request
    ) {
        HrNotificationDto updated = hrNotificationService.update(userDetails.getId(), id, request);
        return ResponseEntity.ok(ResponseDto.success(updated, "Notification updated"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseDto<Void>> delete(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Integer id
    ) {
        hrNotificationService.delete(userDetails.getId(), id);
        return ResponseEntity.ok(ResponseDto.success(null, "Notification deleted"));
    }
}
