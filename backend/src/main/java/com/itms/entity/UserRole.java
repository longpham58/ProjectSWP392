package com.itms.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "UserRole",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"user_id", "role_id"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRole {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // =========================
    // Relationships
    // =========================

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "FK_UserRole_User")
    )
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "role_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "FK_UserRole_Role")
    )
    private Role role;

    // Who assigned this role
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "assigned_by",
            foreignKey = @ForeignKey(name = "FK_UserRole_AssignedBy")
    )
    private User assignedBy;

    // =========================
    // Metadata
    // =========================
    @Column(name = "assigned_at", nullable = false, updatable = false)
    private LocalDateTime assignedAt;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    // =========================
    // Lifecycle
    // =========================
    @PrePersist
    protected void onCreate() {
        this.assignedAt = LocalDateTime.now();
        this.isActive = (this.isActive == null) ? true : this.isActive;
    }
}
