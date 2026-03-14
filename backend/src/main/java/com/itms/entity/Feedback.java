package com.itms.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(
        name = "Feedback",
        uniqueConstraints = {
                @UniqueConstraint(name = "UQ_Feedback_Enrollment",
                        columnNames = {"enrollment_id"})
        }
)
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /* =========================
       Relationships
    ========================= */

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enrollment_id", nullable = false)
    private Enrollment enrollment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id")
    private Session session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /* =========================
       Ratings
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

    @Column(name = "is_anonymous")
    private Boolean isAnonymous = false;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

}