package com.itms.entity;

import jakarta.persistence.*;
<<<<<<< HEAD
import lombok.*;
=======
import lombok.Getter;
import lombok.Setter;
>>>>>>> origin/main

import java.time.LocalDateTime;
import java.util.List;

@Entity
<<<<<<< HEAD
@Table(name = "ClassRoom")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
=======
@Getter
@Setter
@Table(name = "ClassRoom")
>>>>>>> origin/main
public class ClassRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

<<<<<<< HEAD
    @Column(name = "class_code", nullable = false, unique = true, length = 50)
    private String classCode;

    @Column(name = "class_name", length = 255)
=======
    @Column(name = "class_code", nullable = false, unique = true, length = 20)
    private String classCode;

    @Column(name = "class_name", nullable = false, length = 200)
>>>>>>> origin/main
    private String className;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trainer_id")
    private User trainer;

<<<<<<< HEAD
    @Column(name = "max_students", nullable = false)
    private Integer maxStudents = 30;

    @Column(nullable = false, length = 20)
    private String status = "ACTIVE";

    @Column(columnDefinition = "NVARCHAR(MAX)")
=======
    @Column(name = "max_students")
    private Integer maxStudents;

    @Column(name = "status", length = 20)
    private String status;

    @Column(name = "notes", columnDefinition = "NVARCHAR(MAX)")
>>>>>>> origin/main
    private String notes;

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

    @OneToMany(mappedBy = "classRoom", cascade = CascadeType.ALL)
    private List<ClassMember> classMembers;

    @OneToMany(mappedBy = "classRoom", cascade = CascadeType.ALL)
<<<<<<< HEAD
    private List<Session> sessions;

    @OneToMany(mappedBy = "classRoom", cascade = CascadeType.ALL)
    private List<CourseSchedule> schedules;
=======
    private List<CourseSchedule> courseSchedules;

    @OneToMany(mappedBy = "classRoom", cascade = CascadeType.ALL)
    private List<Session> sessions;
>>>>>>> origin/main
}
