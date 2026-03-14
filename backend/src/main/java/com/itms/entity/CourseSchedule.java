package com.itms.entity;

import com.itms.common.LocationType;
import jakarta.persistence.*;
<<<<<<< HEAD
import lombok.*;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "CourseSchedule")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
=======
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "CourseSchedule")
>>>>>>> origin/main
public class CourseSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", nullable = false)
    private ClassRoom classRoom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trainer_id")
    private User trainer;

<<<<<<< HEAD
    @Column(name = "day_of_week", nullable = false, length = 3)
    private String dayOfWeek; // MON, TUE, WED, THU, FRI, SAT, SUN
=======
    @Column(name = "day_of_week", nullable = false, length = 10)
    private String dayOfWeek;
>>>>>>> origin/main

    @Column(name = "time_start", nullable = false)
    private LocalTime timeStart;

    @Column(name = "time_end", nullable = false)
    private LocalTime timeEnd;

<<<<<<< HEAD
    @Column(length = 255)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(name = "location_type", nullable = false, length = 20)
    private LocationType locationType = LocationType.OFFLINE;
=======
    @Column(name = "location", length = 200)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(name = "location_type", length = 20)
    private LocationType locationType;
>>>>>>> origin/main

    @Column(name = "meeting_link", length = 500)
    private String meetingLink;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;
<<<<<<< HEAD
=======

    @OneToMany(mappedBy = "schedule", cascade = CascadeType.ALL)
    private List<Session> sessions;
>>>>>>> origin/main
}
