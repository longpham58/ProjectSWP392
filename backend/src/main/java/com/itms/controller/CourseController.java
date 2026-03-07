package com.itms.controller;

import com.itms.dto.common.ResponseDto;
import com.itms.entity.Course;
import com.itms.security.CustomUserDetails;
import com.itms.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @GetMapping("/my")
    public ResponseEntity<ResponseDto<List<Course>>> getMyCourses(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        int userId = userDetails.getId();

        List<Course> courses = courseService.getCoursesByUserId(userId);

        return ResponseEntity.ok(
                ResponseDto.success(courses, "My courses retrieved successfully")
        );
    }

}