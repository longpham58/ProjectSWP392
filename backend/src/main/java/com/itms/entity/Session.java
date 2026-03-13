package com.itms.entity;

import com.itms.common.LocationType;
import com.itms.common.SessionStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "Session")
public class Session {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /* =========================
       Relationships
    ========================= */

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;

    /* =========================
       Session Info
    ========================= */

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "time_start", nullable = false)
    private LocalTime timeStart;

    @Column(name = "time_end", nullable = false)
    private LocalTime timeEnd;

    /* =========================
       Location
    ========================= */

    private String location;

    @Enumerated(EnumType.STRING)
    @Column(name = "location_type")
    private LocationType locationType;

    @Column(name = "meeting_link")
    private String meetingLink;

    @Column(name = "meeting_password")
    private String meetingPassword;

    /* =========================
       Capacity
    ========================= */

    @Column(name = "max_capacity", nullable = false)
    private Integer maxCapacity;

    @Column(name = "current_enrolled")
    private Integer currentEnrolled = 0;

    /* =========================
       Status
    ========================= */

    @Enumerated(EnumType.STRING)
    private SessionStatus status;

    @Column(name = "cancellation_reason")
    private String cancellationReason;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String notes;

    /* =========================
       Audit
    ========================= */

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "session")
    private List<Feedback> feedbacks;
}