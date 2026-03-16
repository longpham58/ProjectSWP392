package com.itms.controller;

import com.itms.dto.HrCourseDto;
import com.itms.dto.HrTrainerDto;
import com.itms.dto.common.ResponseDto;
import com.itms.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/hr/courses")
@RequiredArgsConstructor
@PreAuthorize("hasRole('HR')")
public class HrCourseController {

    private final CourseService courseService;

    @GetMapping
    public ResponseEntity<ResponseDto<List<HrCourseDto>>> getAllCourses() {
        List<HrCourseDto> courses = courseService.getAllCoursesForHr();
        return ResponseEntity.ok(ResponseDto.success(courses, "HR courses retrieved successfully"));
    }

    @PostMapping
    public ResponseEntity<ResponseDto<HrCourseDto>> createCourse(@RequestBody HrCourseDto request) {
        HrCourseDto created = courseService.createCourseForHr(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponseDto.success(created, "Course created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResponseDto<HrCourseDto>> updateCourse(
            @PathVariable Integer id,
            @RequestBody HrCourseDto request
    ) {
        HrCourseDto updated = courseService.updateCourseForHr(id, request);
        return ResponseEntity.ok(ResponseDto.success(updated, "Course updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseDto<Void>> deleteCourse(@PathVariable Integer id) {
        courseService.deleteCourseForHr(id);
        return ResponseEntity.ok(ResponseDto.success(null, "Course deleted successfully"));
    }

    @GetMapping("/trainers")
    public ResponseEntity<ResponseDto<List<HrTrainerDto>>> getAvailableTrainers() {
        List<HrTrainerDto> trainers = courseService.getActiveTrainersForHr();
        return ResponseEntity.ok(ResponseDto.success(trainers, "Trainers retrieved successfully"));
    }
}
