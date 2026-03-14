package com.itms.entity;

import com.itms.common.CourseStatus;
import com.itms.common.Level;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "Course")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "code", nullable = false, unique = true, length = 20)
    private String code;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(name = "objectives", columnDefinition = "NVARCHAR(MAX)")
    private String objectives;

    @Column(name = "prerequisites", columnDefinition = "NVARCHAR(MAX)")
    private String prerequisites;

    @Column(name = "duration_hours", columnDefinition = "DECIMAL(10,2)")
    private Double durationHours;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trainer_id")
    private User trainer;

    @Column(name = "category", length = 50)
    private String category;

    @Enumerated(EnumType.STRING)
    @Column(name = "level", length = 20)
    private Level level;

    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;

    @Column(name = "passing_score", columnDefinition = "DECIMAL(10,2)")
    private Double passingScore;

    @Column(name = "max_attempts")
    private Integer maxAttempts;

<<<<<<< Updated upstream
=======
    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

>>>>>>> Stashed changes
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private CourseStatus status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

<<<<<<< Updated upstream
=======
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;

>>>>>>> Stashed changes
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL)
    private List<Material> materials;

    @OneToMany(mappedBy = "course")
    private List<Session> sessions;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL)
    private List<ClassRoom> classRooms;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL)
    private List<CourseModule> modules;
}