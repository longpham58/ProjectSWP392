package com.itms.entity;

import jakarta.persistence.*;
import lombok.*;

<<<<<<< HEAD
import java.math.BigDecimal;
=======
>>>>>>> origin/main
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

<<<<<<< HEAD
=======
    // Many progress records belong to one user
>>>>>>> origin/main
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

<<<<<<< HEAD
=======
    // Each progress record is for one module
>>>>>>> origin/main
    @ManyToOne
    @JoinColumn(name = "module_id", nullable = false)
    private CourseModule module;

<<<<<<< HEAD
=======
    // Optional: link to enrollment
>>>>>>> origin/main
    @ManyToOne
    @JoinColumn(name = "enrollment_id")
    private Enrollment enrollment;

<<<<<<< HEAD
    @Column(name = "is_completed", nullable = false)
    private Boolean isCompleted = false;
=======
    @Column(name = "is_completed")
    private Boolean isCompleted;
>>>>>>> origin/main

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

<<<<<<< HEAD
    @Column(name = "progress_percentage", nullable = false, columnDefinition = "DECIMAL(10,2)")
    private BigDecimal progressPercentage = BigDecimal.ZERO;

    @Column(name = "time_spent_minutes", nullable = false)
    private Integer timeSpentMinutes = 0;
=======
    @Column(name = "time_spent_minutes")
    private Integer timeSpentMinutes;
>>>>>>> origin/main

    @Column(name = "last_accessed_at")
    private LocalDateTime lastAccessedAt;

<<<<<<< HEAD
    @Column(name = "created_at", nullable = false)
=======
    @Column(name = "created_at")
>>>>>>> origin/main
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
<<<<<<< HEAD
        if (progressPercentage == null) {
            progressPercentage = BigDecimal.ZERO;
        }
=======
>>>>>>> origin/main
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
