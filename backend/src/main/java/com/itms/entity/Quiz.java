package com.itms.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
<<<<<<< HEAD
import java.time.LocalDate;
=======
>>>>>>> origin/main
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

<<<<<<< HEAD
=======
    // Many quizzes belong to one course
>>>>>>> origin/main
    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

<<<<<<< HEAD
=======
    // Link quiz to a specific module (optional - for module-level quizzes)
>>>>>>> origin/main
    @ManyToOne
    @JoinColumn(name = "module_id")
    private CourseModule module;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String description;

<<<<<<< HEAD
    @Column(name = "quiz_type", nullable = false, length = 20)
    private String quizType;
=======
    @Column(name = "quiz_type", nullable = false)
    private String quizType;
    // PRE_TEST, POST_TEST, ASSESSMENT, PRACTICE
>>>>>>> origin/main

    @Column(name = "total_questions", nullable = false)
    private Integer totalQuestions;

<<<<<<< HEAD
    @Column(name = "total_marks", nullable = false, columnDefinition = "DECIMAL(10,2)")
    private BigDecimal totalMarks;

    @Column(name = "passing_score", nullable = false, columnDefinition = "DECIMAL(10,2)")
    private BigDecimal passingScore;

=======
    @Column(name = "total_marks", nullable = false)
    private BigDecimal totalMarks;

    @Column(name = "passing_score", nullable = false)
    private BigDecimal passingScore;



>>>>>>> origin/main
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

<<<<<<< HEAD
    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "is_final_exam")
    private Boolean isFinalExam;
=======
    // ✅ Add due date
    @Column(name = "due_date")
    private LocalDateTime dueDate;
>>>>>>> origin/main

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

<<<<<<< HEAD
=======
    // Who created the quiz
>>>>>>> origin/main
    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;

<<<<<<< HEAD
    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<QuizQuestion> questions;
}
=======
    // Is this a final exam quiz?
    @Column(name = "is_final_exam")
    private Boolean isFinalExam;
    
    // Quiz questions
    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<QuizQuestion> questions;
}
>>>>>>> origin/main
