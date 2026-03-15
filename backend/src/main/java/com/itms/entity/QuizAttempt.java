package com.itms.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "QuizAttempt")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
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
    @JoinColumn(name = "enrollment_id", nullable = true)
    private Enrollment enrollment;

    @Column(name = "attempt_number")
    private Integer attemptNumber;

    @Column(columnDefinition = "DECIMAL(10,2)")
    private BigDecimal score;

    @Column(name = "total_marks", columnDefinition = "DECIMAL(10,2)")
    private BigDecimal totalMarks;

    @Column(name = "obtained_marks", columnDefinition = "DECIMAL(10,2)")
    private BigDecimal obtainedMarks;

    private Boolean passed;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "time_taken_minutes")
    private Integer timeTakenMinutes;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "quizAttempt", cascade = CascadeType.ALL)
    private List<QuizAnswer> answers;
}
