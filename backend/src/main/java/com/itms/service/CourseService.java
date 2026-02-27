package com.itms.service;

import com.itms.common.CourseStatus;
import com.itms.dto.CourseDto;
import com.itms.dto.CreateCourseRequest;
import com.itms.entity.Course;
import com.itms.entity.User;
import com.itms.repository.CourseRepository;
import com.itms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public List<CourseDto> getCoursesByTrainerId(Integer trainerId) {
        List<Course> courses = courseRepository.findByTrainerIdAndStatusOrderByCreatedAtDesc(
            trainerId, 
            CourseStatus.ACTIVE
        );
        
        return courses.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public CourseDto createCourse(CreateCourseRequest request) {
        User trainer = userRepository.findById(request.getTrainerId())
                .orElseThrow(() -> new RuntimeException("Trainer không tồn tại"));
        
        Course course = Course.builder()
                .code(request.getCode())
                .name(request.getName())
                .description(request.getDescription())
                .objectives(request.getObjectives())
                .prerequisites(request.getPrerequisites())
                .durationHours(request.getDurationHours())
                .category(request.getCategory())
                .level(request.getLevel())
                .thumbnailUrl(request.getThumbnailUrl())
                .passingScore(request.getPassingScore())
                .maxAttempts(request.getMaxAttempts() != null ? request.getMaxAttempts() : 3)
                .status(CourseStatus.ACTIVE)
                .trainer(trainer)
                .build();
        
        Course savedCourse = courseRepository.save(course);
        return convertToDto(savedCourse);
    }

    private CourseDto convertToDto(Course course) {
        return CourseDto.builder()
                .id(course.getId())
                .code(course.getCode())
                .name(course.getName())
                .description(course.getDescription())
                .objectives(course.getObjectives())
                .prerequisites(course.getPrerequisites())
                .durationHours(course.getDurationHours())
                .category(course.getCategory())
                .level(course.getLevel())
                .thumbnailUrl(course.getThumbnailUrl())
                .passingScore(course.getPassingScore())
                .maxAttempts(course.getMaxAttempts())
                .status(course.getStatus().name())
                .trainerName(course.getTrainer() != null ? course.getTrainer().getFullName() : null)
                .build();
    }
}
