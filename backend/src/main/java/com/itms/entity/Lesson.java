package com.itms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "CourseMaterial")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lesson {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", foreignKey = @ForeignKey(name = "FK_CourseMaterial_Course"))
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id", foreignKey = @ForeignKey(name = "FK_CourseMaterial_Module"))
    private Module module;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;

    @Column(name = "type", nullable = false, length = 50)
    private String type;

    @Column(name = "is_required", nullable = false)
    private Boolean isRequired;

    @Column(name = "is_downloadable", nullable = false)
    private Boolean isDownloadable;

    @Column(name = "file_url", length = 500)
    private String fileUrl;

    @Column(name = "file_size")
    private Long fileSize;

    @Transient
    private Integer durationMinutes;

    @PrePersist
    protected void onCreate() {
        if (this.displayOrder == null) this.displayOrder = 0;
        if (this.type == null) this.type = "VIDEO";
        if (this.isRequired == null) this.isRequired = true;
        if (this.isDownloadable == null) this.isDownloadable = false;
    }
}