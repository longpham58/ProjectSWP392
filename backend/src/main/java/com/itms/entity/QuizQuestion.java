package com.itms.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "QuizQuestion")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @Column(name = "question_text", nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String questionText;

    @Column(name = "question_type", length = 20)
    private String questionType;

    @Column(name = "option_a", columnDefinition = "NVARCHAR(500)")
    private String optionA;

    @Column(name = "option_b", columnDefinition = "NVARCHAR(500)")
    private String optionB;

    @Column(name = "option_c", columnDefinition = "NVARCHAR(500)")
    private String optionC;

    @Column(name = "option_d", columnDefinition = "NVARCHAR(500)")
    private String optionD;

    @Column(name = "correct_answer", nullable = false, length = 500)
    private String correctAnswer;

    @Column(name = "marks", columnDefinition = "DECIMAL(10,2)")
    private BigDecimal marks;

    @Column(name = "explanation", columnDefinition = "NVARCHAR(MAX)")
    private String explanation;

    @Column(name = "display_order")
    private Integer displayOrder = 0;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
