package com.itms.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "Attendance")
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
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

    @Enumerated(EnumType.STRING)
    @Column(name = "completion_status", nullable = false, length = 20)
    private CompletionStatus completionStatus = CompletionStatus.IN_PROGRESS;

    private LocalDateTime completionDate;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String notes;

    @ManyToOne
    @JoinColumn(name = "marked_by")
    private User markedBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public enum CompletionStatus {
        IN_PROGRESS, COMPLETED, FAILED, ABSENT
    }
}
