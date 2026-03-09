package com.itms.service;

import com.itms.entity.Course;
import com.itms.entity.Enrollment;
import com.itms.repository.CourseRepository;
import com.itms.repository.EnrollmentRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;

    public List<Course> getCoursesByUserId(int userId) {
        List<Enrollment> enrollments = enrollmentRepository.findByUserId(userId);
        return enrollments.stream()
                .map(e -> e.getSession().getCourse()).distinct()
                .toList();
    }

    public Course getCourseById(int id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Course not found with id: " + id));
    }

}
