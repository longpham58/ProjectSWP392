package com.itms.entity;

import jakarta.persistence.*;
<<<<<<< Updated upstream
=======
import lombok.*;
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream
    private String completionStatus = "IN_PROGRESS";
=======
    @Enumerated(EnumType.STRING)
    @Column(name = "completion_status", nullable = false, length = 20)
    private CompletionStatus completionStatus = CompletionStatus.IN_PROGRESS;
>>>>>>> Stashed changes

    private LocalDateTime completionDate;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String notes;

    @ManyToOne
    @JoinColumn(name = "marked_by")
    private User markedBy;

<<<<<<< Updated upstream
=======
    @Column(name = "created_at")
>>>>>>> Stashed changes
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public enum CompletionStatus {
        IN_PROGRESS, COMPLETED, FAILED, ABSENT
    }
}
