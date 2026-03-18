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
    @JoinColumn(name = "class_id", nullable = false)
    private ClassRoom classRoom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id")
    private CourseSchedule schedule;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trainer_id")
    private User trainer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;

    /* =========================
       Session Info
    ========================= *
     */


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

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.locationType == null) {
            this.locationType = LocationType.OFFLINE;
        }
        if (this.status == null) {
            this.status = SessionStatus.SCHEDULED;
        }
        if (this.maxCapacity == null || this.maxCapacity <= 0) {
            this.maxCapacity = 100;
        }
        if (this.currentEnrolled == null || this.currentEnrolled < 0) {
            this.currentEnrolled = 0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
