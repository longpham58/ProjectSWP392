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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;
    private final CourseModuleService courseModuleService;

    @Value("${upload.dir:uploads/materials}")
    private String uploadDir;

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
    public ResponseEntity<ResponseDto<List<CourseDto>>> getMyTrainerCourses(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        int trainerId = userDetails.getId();
        List<CourseDto> courses = courseService.getCoursesByTrainerId(trainerId)
                .stream()
                .map(CourseDto::fromEntity)
                .toList();

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

    /**
     * Upload a file to a module - saves file to disk and creates material record
     */
    @PostMapping("/modules/{moduleId}/upload")
    public ResponseEntity<ResponseDto<CourseModuleDto.MaterialDto>> uploadMaterial(
            @PathVariable int moduleId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "displayOrder", required = false) Integer displayOrder) {

        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath();
            Files.createDirectories(uploadPath);

            String originalFilename = file.getOriginalFilename();
            String ext = originalFilename != null && originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf('.'))
                    : "";
            String storedFilename = UUID.randomUUID() + ext;
            Path filePath = uploadPath.resolve(storedFilename);
            Files.copy(file.getInputStream(), filePath);

            String fileUrl = "/uploads/" + storedFilename;
            String materialTitle = (title != null && !title.isBlank()) ? title : originalFilename;

            // Detect type from extension
            String type = "DOCUMENT";
            if (ext.equalsIgnoreCase(".pdf")) type = "PDF";
            else if (ext.equalsIgnoreCase(".mp4") || ext.equalsIgnoreCase(".avi")
                    || ext.equalsIgnoreCase(".mov") || ext.equalsIgnoreCase(".mkv")) type = "VIDEO";

            CourseModuleDto.MaterialDto material = courseModuleService.createMaterial(
                    moduleId, materialTitle, description, type, fileUrl, file.getSize(), displayOrder);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ResponseDto.success(material, "Material uploaded successfully"));

        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file: " + e.getMessage());
        }
    }
}