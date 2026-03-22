package com.itms.entity;

import com.itms.entity.*;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "Feedback")
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /* =========================
       Relationships
       Note: enrollment_id NULL = System Feedback, NOT NULL = Course Feedback
    ========================= */

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enrollment_id")
    private Enrollment enrollment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id")
    private Session session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /* =========================
       Ratings (for course feedback)
    ========================= */

    @Column(name = "course_rating")
    private Integer courseRating;

    @Column(name = "trainer_rating")
    private Integer trainerRating;

    @Column(name = "content_rating")
    private Integer contentRating;

    @Column(name = "overall_rating")
    private Integer overallRating;

    /* =========================
       Comments
    ========================= */

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String comments;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String suggestions;

    /* =========================
       Extra Info
    ========================= */

    @Column(name = "would_recommend")
    private Boolean wouldRecommend;

    @Builder.Default
    @Column(name = "is_anonymous", nullable = false)
    private Boolean isAnonymous = false;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "type")
    private FeedbackType type = FeedbackType.COURSE_FEEDBACK;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private FeedbackStatus status = FeedbackStatus.OPEN;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id")
    private User recipient;

    @Builder.Default
    @Column(name = "is_violation")
    private Boolean isViolation = false;
    
    @PrePersist
    protected void onCreate() {
        if (submittedAt == null) {
            submittedAt = LocalDateTime.now();
        }
    }
}
