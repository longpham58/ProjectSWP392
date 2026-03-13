package com.itms.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
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

    // Many quizzes belong to one course
    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    // Link quiz to a specific module (optional - for module-level quizzes)
    @ManyToOne
    @JoinColumn(name = "module_id")
    private CourseModule module;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(name = "quiz_type", nullable = false)
    private String quizType;
    // PRE_TEST, POST_TEST, ASSESSMENT, PRACTICE

    @Column(name = "total_questions", nullable = false)
    private Integer totalQuestions;

    @Column(name = "total_marks", nullable = false)
    private BigDecimal totalMarks;

    @Column(name = "passing_score", nullable = false)
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

    // ✅ Add due date
    @Column(name = "due_date")
    private LocalDateTime dueDate;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Who created the quiz
    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;

    // Is this a final exam quiz?
    @Column(name = "is_final_exam")
    private Boolean isFinalExam;
    
    // Quiz questions
    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<QuizQuestion> questions;
}