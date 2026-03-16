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
    private String content;
    private String channel;
    private String sentTo;
    private String scheduledAt;
    private String sentAt;
    private String creator;
    private String status;
}
