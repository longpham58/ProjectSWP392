package com.itms.entity;

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
@Table(name = "ClassRoom")
public class ClassRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Transient
    private Course course;

    @Column(name = "class_code", nullable = false, unique = true, length = 20)
    private String classCode;

    @Column(name = "class_name", nullable = false, length = 200)
    private String className;

    @Transient
    private User trainer;

    @Transient
    private Integer maxStudents;

    @Transient
    private String status;

    @Transient
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Transient
    private User createdBy;

    @Transient
    private User updatedBy;

    @Transient
    private List<ClassMember> classMembers;

    @Transient
    private List<CourseSchedule> courseSchedules;

    @Transient
    private List<Session> sessions;
}
