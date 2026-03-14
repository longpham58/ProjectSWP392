package com.itms.entity;

import jakarta.persistence.*;
<<<<<<< HEAD
import lombok.*;
=======
import lombok.Getter;
import lombok.Setter;
>>>>>>> origin/main

import java.time.LocalDateTime;

@Entity
<<<<<<< HEAD
@Table(
    name = "ClassMember",
    uniqueConstraints = {
        @UniqueConstraint(name = "UQ_ClassMember_ClassUser", columnNames = {"class_id", "user_id"})
    }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
=======
@Getter
@Setter
@Table(name = "ClassMember")
>>>>>>> origin/main
public class ClassMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", nullable = false)
    private ClassRoom classRoom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "joined_at")
    private LocalDateTime joinedAt;

<<<<<<< HEAD
    @Column(nullable = false, length = 20)
    private String status = "ACTIVE";
=======
    @Column(name = "status", length = 20)
    private String status;

    @Column(name = "notes", columnDefinition = "NVARCHAR(MAX)")
    private String notes;
>>>>>>> origin/main

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "added_by")
    private User addedBy;
<<<<<<< HEAD

    @Column(length = 500)
    private String notes;

    @PrePersist
    protected void onCreate() {
        if (joinedAt == null) {
            joinedAt = LocalDateTime.now();
        }
        if (status == null) {
            status = "ACTIVE";
        }
    }
=======
>>>>>>> origin/main
}
