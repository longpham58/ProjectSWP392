package com.itms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    private String sentDate;
    private String expiresAt;
    private Long recipientCount;
    private Long readCount;
    private String status;
    private String senderName;
    private Integer senderId;
}
