package com.itms.dto;

import com.itms.entity.ClassRoom;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminClassDto {
    private Integer id;
    private String classCode;
    private String className;
    private String courseName;
    private Integer courseId;
    private String courseCode;
    private String trainerName;
    private Integer trainerId;
    private Integer maxStudents;
    private String status;
    private String notes;
    private LocalDateTime createdAt;
    private Long studentCount;
    
    public static AdminClassDto fromEntity(ClassRoom classRoom, Long studentCount) {
        return AdminClassDto.builder()
                .id(classRoom.getId())
                .classCode(classRoom.getClassCode())
                .className(classRoom.getClassName())
                .courseName(classRoom.getCourse() != null ? classRoom.getCourse().getName() : null)
                .courseId(classRoom.getCourse() != null ? classRoom.getCourse().getId() : null)
                .courseCode(classRoom.getCourse() != null ? classRoom.getCourse().getCode() : null)
                .trainerName(classRoom.getTrainer() != null ? classRoom.getTrainer().getFullName() : null)
                .trainerId(classRoom.getTrainer() != null ? classRoom.getTrainer().getId() : null)
                .maxStudents(classRoom.getMaxStudents())
                .status(classRoom.getStatus())
                .notes(classRoom.getNotes())
                .createdAt(classRoom.getCreatedAt())
                .studentCount(studentCount)
                .build();
    }
}
