package com.itms.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
<<<<<<< HEAD
import java.util.List;
=======
>>>>>>> origin/main

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

<<<<<<< HEAD
=======
    // Attempt belongs to a quiz
>>>>>>> origin/main
    @ManyToOne
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

<<<<<<< HEAD
=======
    // User who attempted
>>>>>>> origin/main
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

<<<<<<< HEAD
    @ManyToOne
    @JoinColumn(name = "enrollment_id")
=======
    // Enrollment context
    @ManyToOne
    @JoinColumn(name = "enrollment_id", nullable = true)
>>>>>>> origin/main
    private Enrollment enrollment;

    @Column(name = "attempt_number")
    private Integer attemptNumber;

<<<<<<< HEAD
    @Column(columnDefinition = "DECIMAL(10,2)")
    private BigDecimal score;

    @Column(name = "total_marks", columnDefinition = "DECIMAL(10,2)")
    private BigDecimal totalMarks;

    @Column(name = "obtained_marks", columnDefinition = "DECIMAL(10,2)")
    private BigDecimal obtainedMarks;

    @Column
=======
    private BigDecimal score;

    @Column(name = "total_marks")
    private BigDecimal totalMarks;

    @Column(name = "obtained_marks")
    private BigDecimal obtainedMarks;

>>>>>>> origin/main
    private Boolean passed;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "time_taken_minutes")
    private Integer timeTakenMinutes;

<<<<<<< HEAD
    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "quizAttempt", cascade = CascadeType.ALL)
    private List<QuizAnswer> answers;
}
=======
    @Column(nullable = false)
    private String status;
    // IN_PROGRESS, SUBMITTED, GRADED, ABANDONED

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
>>>>>>> origin/main
