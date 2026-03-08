package com.itms.controller;

import com.itms.dto.CertificateDto;
import com.itms.dto.common.ResponseDto;
import com.itms.service.CertificateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/certificates")
@RequiredArgsConstructor
public class CertificateController {

    private final CertificateService certificateService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<ResponseDto<List<CertificateDto>>> getUserCertificates(@PathVariable Integer userId) {
        List<CertificateDto> certificates = certificateService.getCertificatesByUser(userId);
        return ResponseEntity.ok(ResponseDto.success(certificates, "My certificates retrived successfully"));
    }
}