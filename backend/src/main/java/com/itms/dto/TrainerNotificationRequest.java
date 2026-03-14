package com.itms.dto;

import com.itms.common.NotificationPriority;
import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TrainerNotificationRequest {
    
    private String title;
    private String message;
    private NotificationPriority priority;
    private String recipientType; // "STUDENTS" or "HR"
    private List<String> classCodes; // For students
    private Boolean isDraft; // true for draft, false for send immediately
}
