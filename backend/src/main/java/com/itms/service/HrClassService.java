package com.itms.service;

import com.itms.dto.HrClassDto;
import com.itms.entity.ClassRoom;
import com.itms.entity.Course;
import com.itms.repository.ClassRoomRepository;
import com.itms.repository.CourseRepository;
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

    public List<HrClassDto> getAll() {
        return classRoomRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public HrClassDto create(HrClassDto dto) {
        String classCode = trimRequired(dto.getClassCode(), "Mã lớp không được để trống");
        String className = trimRequired(dto.getClassName(), "Tên lớp không được để trống");

        if (classRoomRepository.findByClassCode(classCode).isPresent()) {
            throw new IllegalArgumentException("Mã lớp đã tồn tại");
        }

        Course fallbackCourse = courseRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Cần tạo ít nhất một khóa học trước khi tạo lớp"));

        ClassRoom item = new ClassRoom();
        item.setClassCode(classCode);
        item.setClassName(className);
        item.setCourse(fallbackCourse);
        item.setStatus("ACTIVE");
        item.setCreatedAt(LocalDateTime.now());
        item.setUpdatedAt(LocalDateTime.now());

        return toDto(classRoomRepository.save(item));
    }

    @Transactional
    public HrClassDto update(Integer id, HrClassDto dto) {
        ClassRoom item = classRoomRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy lớp với id: " + id));

        String classCode = trimRequired(dto.getClassCode(), "Mã lớp không được để trống");
        String className = trimRequired(dto.getClassName(), "Tên lớp không được để trống");

        classRoomRepository.findByClassCode(classCode)
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Mã lớp đã tồn tại");
                });

        item.setClassCode(classCode);
        item.setClassName(className);
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
                .build();
    }

    private String trimRequired(String value, String message) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException(message);
        }
        return value.trim();
    }
}
