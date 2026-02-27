package com.itms.controller;

import com.itms.dto.CourseDto;
import com.itms.dto.CreateCourseRequest;
import com.itms.dto.common.ResponseDto;
import com.itms.security.CustomUserDetails;
import com.itms.service.CourseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
@Tag(name = "Course Management", description = "APIs for managing courses")
public class CourseController {

    private final CourseService courseService;

    @GetMapping("/my-courses")
    @Operation(summary = "Get courses of logged-in trainer")
    public ResponseEntity<ResponseDto<List<CourseDto>>> getMyCourses(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Integer trainerId = userDetails.getId();
        List<CourseDto> courses = courseService.getCoursesByTrainerId(trainerId);
        
        return ResponseEntity.ok(
            ResponseDto.<List<CourseDto>>builder()
                    .success(true)
                    .message("Lấy danh sách khóa học thành công")
                    .data(courses)
                    .build()
        );
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Create new course (Admin/HR only)")
    public ResponseEntity<ResponseDto<CourseDto>> createCourse(
            @Valid @RequestBody CreateCourseRequest request
    ) {
        CourseDto course = courseService.createCourse(request);
        
        return ResponseEntity.ok(
            ResponseDto.<CourseDto>builder()
                    .success(true)
                    .message("Tạo khóa học thành công")
                    .data(course)
                    .build()
        );
    }
}
