package com.itms.entity;


import com.itms.common.NotificationPriority;
import com.itms.common.NotificationType;
import com.itms.common.ReferenceType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "Notification")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Many notifications belong to one user (recipient)
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    // Sender of the notification
    @ManyToOne
    @JoinColumn(name = "sender_id")
    private User sender;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private NotificationType type;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String message;

    @Column(name = "reference_id")
    private Integer referenceId;

    @Enumerated(EnumType.STRING)
    @Column(name = "reference_type")
    private ReferenceType referenceType;
    
    // Recipient type: STUDENTS, HR, etc.
    @Column(name = "recipient_type", length = 50)
    private String recipientType;
    
    // Class codes (comma-separated or JSON)
    @Column(name = "class_codes", columnDefinition = "NVARCHAR(MAX)")
    private String classCodes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationPriority priority = NotificationPriority.NORMAL;

    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @Column(name = "sent_date", nullable = false)
    private LocalDateTime sentDate;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "detail_content", columnDefinition = "NVARCHAR(MAX)")
    private String detailContent;
    
    // To track if this is a draft notification
    @Column(name = "is_draft")
    private Boolean isDraft = false;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (sentDate == null) {
            sentDate = LocalDateTime.now();
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
    
    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
