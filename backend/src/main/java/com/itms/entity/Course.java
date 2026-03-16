package com.itms.entity;

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

    // Current DB in use does not expose start_date/end_date columns.
    @Transient
    private java.time.LocalDate startDate;

    @Transient
    private java.time.LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private CourseStatus status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL)
    private List<Material> materials;

    @OneToMany(mappedBy = "course")
    private List<Session> sessions;

    @PrePersist
    protected void onCreate() {
        if (this.status == null) {
            this.status = CourseStatus.DRAFT;
        }
        this.createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}