package com.itms.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "QuizQuestion")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class QuizQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // =============================
    // Relationship
    // =============================
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    // =============================
    // Question
    // =============================
    @Column(name = "question_text", nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String questionText;

    @Column(name = "question_type")
    private String questionType; // MCQ, TRUE_FALSE, etc

    // =============================
    // Options
    // =============================
    @Column(name = "option_a", columnDefinition = "NVARCHAR(500)")
    private String optionA;

    @Column(name = "option_b", columnDefinition = "NVARCHAR(500)")
    private String optionB;

    @Column(name = "option_c", columnDefinition = "NVARCHAR(500)")
    private String optionC;

    @Column(name = "option_d", columnDefinition = "NVARCHAR(500)")
    private String optionD;

    // =============================
    // Answer
    // =============================
    @Column(name = "correct_answer", nullable = false, length = 500)
    private String correctAnswer;
    // Example: A, B, C, D or 0,1,2,3 depending on your system

    // =============================
    // Marks
    // =============================
    @Column(name = "marks", columnDefinition = "DECIMAL(10,2)")
    private BigDecimal marks;

    @Column(name = "explanation", columnDefinition = "NVARCHAR(MAX)")
    private String explanation;

    // =============================
    // Order
    // =============================
    @Column(name = "display_order")
    private Integer displayOrder = 0;

    // =============================
    // Audit fields
    // =============================
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
