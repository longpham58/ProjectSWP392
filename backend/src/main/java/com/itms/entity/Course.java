package com.itms.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.itms.common.CourseStatus;
import com.itms.common.Level;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "Course")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "code")
    private String code;

    @Column(name = "name")
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "objectives")
    private String objectives;

    @Column(name = "prerequisites")
    private String prerequisites;

    @Column(name = "duration_hours")
    private Double durationHours;

    // FK to User table
    @ManyToOne
    @JoinColumn(name = "trainer_id")
    private User trainer;

    @Column(name = "category")
    private String category;

    @Enumerated(EnumType.STRING)
    @Column(name = "level")
    private Level level;

    @Column(name = "thumbnail_url")
    private String thumbnailUrl;

    @Column(name = "passing_score")
    private Double passingScore;

    @Column(name = "max_attempts")
    private Integer maxAttempts;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private CourseStatus status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL)
    private List<Material> materials;

    @OneToMany(mappedBy = "course")
    private List<Session> sessions;
}