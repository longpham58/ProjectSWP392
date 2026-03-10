package com.itms.entity;

import jakarta.persistence.*;
import lombok.*;

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

    @ManyToOne
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @Column(nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String question;

    @Column(name = "option_a", nullable = false, columnDefinition = "NVARCHAR(500)")
    private String optionA;

    @Column(name = "option_b", nullable = false, columnDefinition = "NVARCHAR(500)")
    private String optionB;

    @Column(name = "option_c", nullable = false, columnDefinition = "NVARCHAR(500)")
    private String optionC;

    @Column(name = "option_d", nullable = false, columnDefinition = "NVARCHAR(500)")
    private String optionD;

    @Column(name = "correct_answer", nullable = false)
    private Integer correctAnswer; // 0=A, 1=B, 2=C, 3=D

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;
}
