package com.itms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HrNotificationDto {
    private Integer id;
    private String title;
    // legacy fields (used by old service)
    private String content;
    private String channel;
    private String sentTo;
    private String scheduledAt;
    private String sentAt;
    private String creator;
    private String status;
    // new fields from frontend CreateNotificationModal
    private String message;
    private String type;
    private String priority;
    private String recipientType;
    private java.util.List<String> classCodes;
    private java.util.List<String> trainerIds;
    private Boolean isDraft;
}
