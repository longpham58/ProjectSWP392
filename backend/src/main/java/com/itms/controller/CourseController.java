package com.itms.controller;

import com.itms.dto.CourseModuleDto;
import com.itms.dto.common.ResponseDto;
import com.itms.entity.Course;
import com.itms.security.CustomUserDetails;
import com.itms.service.CourseModuleService;
import com.itms.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;
    private final CourseModuleService courseModuleService;

    @GetMapping("/my")
    public ResponseEntity<ResponseDto<List<Course>>> getMyCourses(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        int userId = userDetails.getId();

        List<Course> courses = courseService.getCoursesByUserId(userId);

        return ResponseEntity.ok(
                ResponseDto.success(courses, "My courses retrieved successfully")
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseDto<Course>> getCourseById(@PathVariable int id) {
        Course course = courseService.getCourseById(id);
        return ResponseEntity.ok(
                ResponseDto.success(course, "Course retrieved successfully")
        );
    }

    @GetMapping("/{id}/modules")
    public ResponseEntity<ResponseDto<List<CourseModuleDto>>> getCourseModules(@PathVariable int id) {
        List<CourseModuleDto> modules = courseModuleService.getModulesByCourseId(id);
        return ResponseEntity.ok(
                ResponseDto.success(modules, "Course modules retrieved successfully")
        );
    }

    @PostMapping("/{courseId}/modules")
    public ResponseEntity<ResponseDto<CourseModuleDto>> createModule(
            @PathVariable int courseId,
            @RequestBody Map<String, String> request) {

        String title = request.get("title");
        String description = request.get("description");
        Integer displayOrder = request.get("displayOrder") != null ? 
                Integer.parseInt(request.get("displayOrder")) : null;

        CourseModuleDto module = courseModuleService.createModule(courseId, title, description, displayOrder);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponseDto.success(module, "Module created successfully"));
    }

    @PutMapping("/modules/{moduleId}")
    public ResponseEntity<ResponseDto<CourseModuleDto>> updateModule(
            @PathVariable int moduleId,
            @RequestBody Map<String, String> request) {

        String title = request.get("title");
        String description = request.get("description");
        Integer displayOrder = request.get("displayOrder") != null ? 
                Integer.parseInt(request.get("displayOrder")) : null;

        CourseModuleDto module = courseModuleService.updateModule(moduleId, title, description, displayOrder);
        return ResponseEntity.ok(
                ResponseDto.success(module, "Module updated successfully")
        );
    }

    @DeleteMapping("/modules/{moduleId}")
    public ResponseEntity<ResponseDto<Void>> deleteModule(@PathVariable int moduleId) {
        courseModuleService.deleteModule(moduleId);
        return ResponseEntity.ok(
                ResponseDto.success(null, "Module deleted successfully")
        );
    }
}