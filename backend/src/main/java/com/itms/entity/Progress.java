package com.itms.entity;

import com.itms.common.CompletionStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "UserModuleProgress", uniqueConstraints = @UniqueConstraint(columnNames = {"enrollment_id", "lesson_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Progress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "FK_UserModuleProgress_User"))
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id", foreignKey = @ForeignKey(name = "FK_UserModuleProgress_Module"))
    private Module module;

    // Track per-lesson completion
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", foreignKey = @ForeignKey(name = "FK_UserModuleProgress_Lesson"))
    private Lesson lesson;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enrollment_id", foreignKey = @ForeignKey(name = "FK_UserModuleProgress_Enrollment"))
    private Enrollment enrollment;

    @Column(name = "is_completed", nullable = false)
    private Boolean isCompleted;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "progress_percentage", precision = 5, scale = 2)
    private BigDecimal progressPercentage;

    @Column(name = "time_spent_minutes")
    private Integer timeSpentMinutes;

    @Column(name = "last_accessed_at")
    private LocalDateTime lastAccessedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.isCompleted == null) this.isCompleted = false;
        if (this.progressPercentage == null) this.progressPercentage = BigDecimal.ZERO;
        if (this.timeSpentMinutes == null) this.timeSpentMinutes = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @Transient
    public CompletionStatus getStatus() {
        return Boolean.TRUE.equals(this.isCompleted) ? CompletionStatus.COMPLETED : CompletionStatus.IN_PROGRESS;
    }

    public void setStatus(CompletionStatus status) {
        boolean completed = status == CompletionStatus.COMPLETED;
        this.isCompleted = completed;
        this.progressPercentage = completed ? BigDecimal.valueOf(100) : BigDecimal.ZERO;
        this.completedAt = completed ? LocalDateTime.now() : null;
    }
}
