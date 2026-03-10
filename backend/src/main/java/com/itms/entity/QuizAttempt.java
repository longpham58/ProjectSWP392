package com.itms.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "QuizAttempt")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Attempt belongs to a quiz
    @ManyToOne
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    // User who attempted
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Enrollment context
    @ManyToOne
    @JoinColumn(name = "enrollment_id")
    private Enrollment enrollment;

    @Column(name = "attempt_number")
    private Integer attemptNumber;

    private BigDecimal score;

    @Column(name = "total_marks")
    private BigDecimal totalMarks;

    @Column(name = "obtained_marks")
    private BigDecimal obtainedMarks;

    private Boolean passed;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "time_taken_minutes")
    private Integer timeTakenMinutes;

    @Column(nullable = false)
    private String status;
    // IN_PROGRESS, SUBMITTED, GRADED, ABANDONED

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}