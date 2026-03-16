package com.itms.controller;

import com.itms.dto.CourseDto;
import com.itms.dto.CourseModuleDto;
import com.itms.dto.TrainerScheduleDto;
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
    public ResponseEntity<ResponseDto<List<CourseDto>>> getMyCourses(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        int userId = userDetails.getId();

        List<CourseDto> courses = courseService.getCourseDtosByUserId(userId);

        return ResponseEntity.ok(
                ResponseDto.success(courses, "My courses retrieved successfully")
        );
    }

    /**
     * Get courses assigned to the current trainer
     */
    @GetMapping("/my/trainer")
    public ResponseEntity<ResponseDto<List<Course>>> getMyTrainerCourses(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        int trainerId = userDetails.getId();

        List<Course> courses = courseService.getCoursesByTrainerId(trainerId);

        return ResponseEntity.ok(
                ResponseDto.success(courses, "Trainer courses retrieved successfully")
        );
    }

    /**
     * Get schedule for the current trainer
     */
    @GetMapping("/my/trainer/schedule")
    public ResponseEntity<ResponseDto<List<TrainerScheduleDto>>> getMyTrainerSchedule(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        int trainerId = userDetails.getId();

        List<TrainerScheduleDto> schedule = courseService.getScheduleByTrainerId(trainerId);

        return ResponseEntity.ok(
                ResponseDto.success(schedule, "Trainer schedule retrieved successfully")
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseDto<CourseDto>> getCourseById(@PathVariable int id, @AuthenticationPrincipal CustomUserDetails userDetails) {
        int userId = userDetails.getId();
        CourseDto course = courseService.getCourseByIdWithAttendance(id, userId);
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
    
    /**
     * Add material to a module
     */
    @PostMapping("/modules/{moduleId}/materials")
    public ResponseEntity<ResponseDto<CourseModuleDto.MaterialDto>> createMaterial(
            @PathVariable int moduleId,
            @RequestBody Map<String, Object> request) {
        
        String title = (String) request.get("title");
        String description = (String) request.get("description");
        String type = (String) request.get("type");
        String fileUrl = (String) request.get("fileUrl");
        Long fileSize = request.get("fileSize") != null ? 
                Long.parseLong(request.get("fileSize").toString()) : null;
        Integer displayOrder = request.get("displayOrder") != null ? 
                Integer.parseInt(request.get("displayOrder").toString()) : null;
        
        CourseModuleDto.MaterialDto material = courseModuleService.createMaterial(
                moduleId, title, description, type, fileUrl, fileSize, displayOrder);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponseDto.success(material, "Material created successfully"));
    }
    
    /**
     * Delete a material
     */
    @DeleteMapping("/materials/{materialId}")
    public ResponseEntity<ResponseDto<Void>> deleteMaterial(@PathVariable Long materialId) {
        courseModuleService.deleteMaterial(materialId);
        return ResponseEntity.ok(
                ResponseDto.success(null, "Material deleted successfully")
        );
    }
}