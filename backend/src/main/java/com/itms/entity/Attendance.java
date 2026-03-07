package com.itms.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "Attendance")
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "enrollment_id", nullable = false, unique = true)
    private Enrollment enrollment;

    private Boolean attended = false;

    private LocalDateTime checkInTime;

    private LocalDateTime checkOutTime;

    private Integer durationMinutes;

    private String completionStatus = "IN_PROGRESS";

    private LocalDateTime completionDate;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String notes;

    @ManyToOne
    @JoinColumn(name = "marked_by")
    private User markedBy;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
