package com.itms.entity;

import com.itms.common.EnrollmentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(
        name = "Enrollment",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "UQ_Enrollment_UserSession",
                        columnNames = {"user_id", "session_id"}
                )
        }
)
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    /* =========================
       Relationships
    ========================= */

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private Session session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    /* =========================
       Status
    ========================= */

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EnrollmentStatus status = EnrollmentStatus.REGISTERED;

    /* =========================
       Approval
    ========================= */

    @Column(name = "approval_date")
    private LocalDateTime approvalDate;

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    @Column(name = "cancellation_reason", length = 500)
    private String cancellationReason;

    /* =========================
       Progress
    ========================= */

    @Column(name = "registered_at")
    private LocalDateTime registeredAt;

    @Column(name = "completion_date")
    private LocalDateTime completionDate;

    @Column(name = "completion_rate", columnDefinition = "DECIMAL(10,2)")
    private BigDecimal completionRate;

    @Column(name = "final_score", columnDefinition = "DECIMAL(10,2)")
    private BigDecimal finalScore;

    @Column(name = "certificate_issued", nullable = false)
    private Boolean certificateIssued = false;

    /* =========================
       Audit
    ========================= */

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
