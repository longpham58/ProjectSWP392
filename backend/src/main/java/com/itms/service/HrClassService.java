package com.itms.service;

import com.itms.dto.HrClassDto;
import com.itms.entity.ClassRoom;
import com.itms.entity.Course;
import com.itms.entity.User;
import com.itms.repository.ClassRoomRepository;
import com.itms.repository.CourseRepository;
import com.itms.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HrClassService {

    private final ClassRoomRepository classRoomRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public List<HrClassDto> getAll() {
        return classRoomRepository.findAllWithCourseAndTrainer().stream()
                .map(this::toDto)
                .toList();
    }

    public List<HrClassDto> getByCourseId(Integer courseId) {
        return classRoomRepository.findByCourseId(courseId).stream()
                .map(this::toDto)
                .toList();
    }

    public List<HrClassDto> getTrainers() {
        return userRepository.findAllActiveTrainers().stream()
                .map(u -> HrClassDto.builder()
                        .trainerId(u.getId())
                        .trainerName(u.getFullName())
                        .build())
                .toList();
    }

    @Transactional
    public HrClassDto create(HrClassDto dto) {
        String classCode = trimRequired(dto.getClassCode(), "Mã lớp không được để trống");

        if (classRoomRepository.findByClassCode(classCode).isPresent()) {
            throw new IllegalArgumentException("Mã lớp đã tồn tại");
        }

        Course course;
        if (dto.getCourseId() != null) {
            course = courseRepository.findById(dto.getCourseId())
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy khóa học với id: " + dto.getCourseId()));
            if (com.itms.common.CourseStatus.INACTIVE.equals(course.getStatus())) {
                throw new IllegalArgumentException("Khóa học đang INACTIVE, không thể tạo lớp học mới");
            }
        } else {
            course = courseRepository.findAll().stream()
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Cần tạo ít nhất một khóa học trước khi tạo lớp"));
        }

        User trainer = null;
        if (dto.getTrainerId() != null) {
            trainer = userRepository.findById(dto.getTrainerId()).orElse(null);
        }

        ClassRoom item = new ClassRoom();
        item.setClassCode(classCode);
        item.setClassName(dto.getClassName() != null ? dto.getClassName().trim() : null);
        item.setCourse(course);
        item.setTrainer(trainer);
        item.setMaxStudents(dto.getMaxStudents());
        item.setStatus(dto.getStatus() != null ? dto.getStatus() : "ACTIVE");
        item.setNotes(dto.getNotes());
        item.setCreatedAt(LocalDateTime.now());
        item.setUpdatedAt(LocalDateTime.now());

        return toDto(classRoomRepository.save(item));
    }

    @Transactional
    public HrClassDto update(Integer id, HrClassDto dto) {
        ClassRoom item = classRoomRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy lớp với id: " + id));

        String classCode = trimRequired(dto.getClassCode(), "Mã lớp không được để trống");

        classRoomRepository.findByClassCode(classCode)
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Mã lớp đã tồn tại");
                });

        if (dto.getCourseId() != null) {
            Course course = courseRepository.findById(dto.getCourseId())
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy khóa học với id: " + dto.getCourseId()));
            item.setCourse(course);
        }

        User trainer = null;
        if (dto.getTrainerId() != null) {
            trainer = userRepository.findById(dto.getTrainerId()).orElse(null);
        }

        item.setClassCode(classCode);
        item.setClassName(dto.getClassName() != null ? dto.getClassName().trim() : null);
        item.setTrainer(trainer);
        item.setMaxStudents(dto.getMaxStudents());
        if (dto.getStatus() != null) item.setStatus(dto.getStatus());
        item.setNotes(dto.getNotes());
        item.setUpdatedAt(LocalDateTime.now());

        return toDto(classRoomRepository.save(item));
    }

    @Transactional
    public void delete(Integer id) {
        if (!classRoomRepository.existsById(id)) {
            throw new EntityNotFoundException("Không tìm thấy lớp với id: " + id);
        }
        classRoomRepository.deleteById(id);
    }

    private HrClassDto toDto(ClassRoom item) {
        return HrClassDto.builder()
                .id(item.getId())
                .classCode(item.getClassCode())
                .className(item.getClassName())
                .courseId(item.getCourse() != null ? item.getCourse().getId() : null)
                .courseName(item.getCourse() != null ? item.getCourse().getName() : null)
                .courseCode(item.getCourse() != null ? item.getCourse().getCode() : null)
                .trainerId(item.getTrainer() != null ? item.getTrainer().getId() : null)
                .trainerName(item.getTrainer() != null ? item.getTrainer().getFullName() : null)
                .maxStudents(item.getMaxStudents())
                .status(item.getStatus())
                .notes(item.getNotes())
                .build();
    }

    private String trimRequired(String value, String message) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException(message);
        }
        return value.trim();
    }
}
