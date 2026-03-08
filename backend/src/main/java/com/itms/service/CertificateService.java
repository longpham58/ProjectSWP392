package com.itms.service;

import com.itms.dto.CertificateDto;
import com.itms.entity.Certificate;
import com.itms.repository.CertificateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CertificateService {
    private final CertificateRepository certificateRepository;
    public List<CertificateDto> getCertificatesByUser(Integer userId) {

        List<Certificate> certificates = certificateRepository.findByUserId(userId);

        return certificates.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private CertificateDto mapToDto(Certificate certificate) {
        return CertificateDto.builder()
                .id(certificate.getId())
                .courseId(certificate.getCourse().getId())
                .courseName(certificate.getCourse().getName())
                .studentName(certificate.getUser().getFullName())
                .completionDate(certificate.getIssueDate())
                .grade(certificate.getGrade() != null ? certificate.getGrade().name() : null)
                .instructor(
                        certificate.getIssuedBy() != null
                                ? certificate.getIssuedBy().getFullName()
                                : null
                )
                .certificateUrl(certificate.getCertificateUrl())
                .build();
    }
}
