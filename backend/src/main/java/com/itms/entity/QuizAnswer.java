package com.itms.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "QuizAnswer")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Answer belongs to an attempt
    @ManyToOne
    @JoinColumn(name = "attempt_id", nullable = false)
    private QuizAttempt quizAttempt;

    // Answer is for a question
    @ManyToOne
    @JoinColumn(name = "question_id", nullable = false)
    private QuizQuestion question;

    // User's answer
    @Column(name = "user_answer", columnDefinition = "NVARCHAR(MAX)")
    private String userAnswer;

    // Whether the answer is correct
    @Column(name = "is_correct")
    private Boolean isCorrect;

    // Marks obtained for this answer
    @Column(name = "marks_obtained", columnDefinition = "DECIMAL(10,2)")
    private BigDecimal marksObtained;

    // When the answer was submitted
    @Column(name = "answered_at")
    private LocalDateTime answeredAt;
}
