package com.itms.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "Quiz")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne
    @JoinColumn(name = "module_id")
    private CourseModule module;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(name = "quiz_type", nullable = false, length = 20)
    private String quizType;

    @Column(name = "total_questions", nullable = false)
    private Integer totalQuestions;

    @Column(name = "total_marks", nullable = false, columnDefinition = "DECIMAL(10,2)")
    private BigDecimal totalMarks;

    @Column(name = "passing_score", nullable = false, columnDefinition = "DECIMAL(10,2)")
    private BigDecimal passingScore;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Column(name = "max_attempts")
    private Integer maxAttempts;

    @Column(name = "randomize_questions")
    private Boolean randomizeQuestions;

    @Column(name = "show_correct_answers")
    private Boolean showCorrectAnswers;

    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "is_final_exam")
    private Boolean isFinalExam;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<QuizQuestion> questions;
}
