package com.itms.dto;

import com.itms.common.ReferenceType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class NotificationDto {

    private Integer id;
    private String title;
    private String message;
    private LocalDateTime date;
    private Boolean read;
    private String type;
    private ReferenceType referenceType;
    private Integer referenceId;
    private String detail_content;

    // Extra fields for trainer notification UI
    private String priority;
    private Boolean isRead;
    private Boolean isDraft;
    private LocalDateTime sentDate;
    private LocalDateTime createdAt;
    private String category;
    private String sender;
    private java.util.List<String> recipients;
    private String recipientType;
    private String classCodes;
}
