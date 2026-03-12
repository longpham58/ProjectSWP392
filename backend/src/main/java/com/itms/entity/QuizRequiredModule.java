package com.itms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Junction table for Quiz-Module many-to-many relationship.
 * Defines which modules must be completed to unlock a quiz.
 * A quiz unlocks when ANY ONE of its required modules is completed.
 */
@Entity
@Table(name = "Quiz_Required_Modules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizRequiredModule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @ManyToOne
    @JoinColumn(name = "module_id", nullable = false)
    private CourseModule module;
}
