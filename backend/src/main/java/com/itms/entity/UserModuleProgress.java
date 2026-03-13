package com.itms.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "UserModuleProgress")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserModuleProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Many progress records belong to one user
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Each progress record is for one module
    @ManyToOne
    @JoinColumn(name = "module_id", nullable = false)
    private CourseModule module;

    // Optional: link to enrollment
    @ManyToOne
    @JoinColumn(name = "enrollment_id")
    private Enrollment enrollment;

    @Column(name = "is_completed")
    private Boolean isCompleted;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "time_spent_minutes")
    private Integer timeSpentMinutes;

    @Column(name = "last_accessed_at")
    private LocalDateTime lastAccessedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (isCompleted == null) {
            isCompleted = false;
        }
        if (timeSpentMinutes == null) {
            timeSpentMinutes = 0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
