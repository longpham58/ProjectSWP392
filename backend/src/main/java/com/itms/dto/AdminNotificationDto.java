package com.itms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminNotificationDto {
    private Integer id;
    private String title;
    private String content;
    private String type;
    private String priority;
    private String targetRole;
    private LocalDate sentDate;
    private LocalDate expiresAt;
    private Long recipientCount;
    private Long readCount;
    private String status;
    private String senderName;
    private Integer senderId;
}
