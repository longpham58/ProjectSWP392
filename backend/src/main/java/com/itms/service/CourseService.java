package com.itms.service;

import com.itms.entity.Course;
import com.itms.entity.Enrollment;
import com.itms.repository.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final EnrollmentRepository enrollmentRepository;

    public List<Course> getCoursesByUserId(int userId) {

        List<Enrollment> enrollments = enrollmentRepository.findByUserId(userId);

        return enrollments.stream()
                .map(e -> e.getSession().getCourse()).distinct()
                .toList();
    }


}
