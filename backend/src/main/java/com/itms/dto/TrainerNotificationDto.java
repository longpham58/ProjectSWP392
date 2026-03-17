package com.itms.dto;

import com.itms.common.NotificationPriority;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TrainerNotificationDto {
    
    private Integer id;
    private String title;
    private String message;
    private LocalDateTime sentDate;
    private Boolean isRead;
    private String type;
    private NotificationPriority priority;
    private String category; // "inbox", "sent", "draft"
    private String sender; // For inbox
    private List<String> recipients; // For sent
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
