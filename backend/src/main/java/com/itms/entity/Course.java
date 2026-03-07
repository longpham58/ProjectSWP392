package com.itms.entity;

import com.itms.common.CourseStatus;
import com.itms.common.Level;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "courses")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String code;

    private String name;

    private String description;

    private String objectives;

    private String prerequisites;

    private Integer durationHours;

    private String trainer;

    private String category;

    @Enumerated(EnumType.STRING)
    private Level level;

    private String thumbnailUrl;

    private Integer passingScore;

    private Integer maxAttempts;

    @Enumerated(EnumType.STRING)
    private CourseStatus status;

    private LocalDate createdAt;

    private LocalDate startDate;

    private LocalDate endDate;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL)
    private List<Material> materials;

    @OneToMany(mappedBy = "course")
    private List<Session> sessions;
}
