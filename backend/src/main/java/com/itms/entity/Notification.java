package com.itms.entity;

<<<<<<< HEAD
=======

>>>>>>> origin/main
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

<<<<<<< HEAD
=======
    // Many notifications belong to one user (recipient)
>>>>>>> origin/main
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
<<<<<<< HEAD
=======
    // Sender of the notification
>>>>>>> origin/main
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

<<<<<<< HEAD
    @Column(name = "detail_content", columnDefinition = "NVARCHAR(MAX)")
    private String detailContent;

=======
>>>>>>> origin/main
    @Column(name = "reference_id")
    private Integer referenceId;

    @Enumerated(EnumType.STRING)
<<<<<<< HEAD
    @Column(name = "reference_type", length = 50)
    private ReferenceType referenceType;

    @Column(name = "recipient_type", length = 50)
    private String recipientType;

    @Column(name = "class_codes", columnDefinition = "NVARCHAR(MAX)")
    private String classCodes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
=======
    @Column(name = "reference_type")
    private ReferenceType referenceType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
>>>>>>> origin/main
    private NotificationPriority priority = NotificationPriority.NORMAL;

    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

<<<<<<< HEAD
    @Column(name = "is_draft", nullable = false)
    private Boolean isDraft = false;

=======
>>>>>>> origin/main
    @Column(name = "read_at")
    private LocalDateTime readAt;

    @Column(name = "sent_date", nullable = false)
    private LocalDateTime sentDate;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

<<<<<<< HEAD
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
=======
    @Column(name = "detail_content")
    private String detailContent;
    
    // To track if this is a sent item for the sender
    @Column(name = "is_sent_copy")
    private Boolean isSentCopy = false;
>>>>>>> origin/main

    @PrePersist
    public void prePersist() {
        if (sentDate == null) {
            sentDate = LocalDateTime.now();
        }
<<<<<<< HEAD
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
=======
>>>>>>> origin/main
    }
}
