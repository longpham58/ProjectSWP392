package com.itms.service;

import com.itms.dto.CourseModuleDto;
import com.itms.entity.Course;
import com.itms.entity.CourseModule;
import com.itms.entity.Material;
import com.itms.entity.Quiz;
import com.itms.repository.CourseModuleRepository;
import com.itms.repository.CourseRepository;
import com.itms.repository.MaterialRepository;
import com.itms.repository.QuizRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseModuleService {

    private final CourseModuleRepository courseModuleRepository;
    private final CourseRepository courseRepository;
    private final QuizRepository quizRepository;
    private final MaterialRepository materialRepository;

    public List<CourseModuleDto> getModulesByCourseId(int courseId) {
        List<CourseModule> modules = courseModuleRepository.findByCourseIdOrderByDisplayOrderAsc(courseId);
        
        return modules.stream()
                .map(module -> {
                    // Fetch quizzes for this module
                    List<Quiz> quizzes = quizRepository.findByModuleId(module.getId());
                    return CourseModuleDto.from(module, quizzes);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public CourseModuleDto createModule(int courseId, String title, String description, Integer displayOrder) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + courseId));

        CourseModule module = new CourseModule();
        module.setCourse(course);
        module.setTitle(title);
        module.setDescription(description);
        module.setDisplayOrder(displayOrder != null ? displayOrder : 0);
        module.setMaterials(java.util.List.of());

        CourseModule saved = courseModuleRepository.save(module);
        saved.setMaterials(java.util.List.of());
        return CourseModuleDto.from(saved);
    }

    @Transactional
    public CourseModuleDto updateModule(int moduleId, String title, String description, Integer displayOrder) {
        CourseModule module = courseModuleRepository.findById(moduleId)
                .orElseThrow(() -> new RuntimeException("Module not found with id: " + moduleId));

        if (title != null && !title.isBlank()) {
            module.setTitle(title);
        }
        if (description != null) {
            module.setDescription(description);
        }
        if (displayOrder != null) {
            module.setDisplayOrder(displayOrder);
        }

        CourseModule saved = courseModuleRepository.save(module);
        if (saved.getMaterials() == null) saved.setMaterials(java.util.List.of());
        return CourseModuleDto.from(saved);
    }

    @Transactional
    public void deleteModule(int moduleId) {
        if (!courseModuleRepository.existsById(moduleId)) {
            throw new RuntimeException("Module not found with id: " + moduleId);
        }
        courseModuleRepository.deleteById(moduleId);
    }
    
    @Transactional
    public CourseModuleDto.MaterialDto createMaterial(int moduleId, String title, String description, 
            String type, String fileUrl, Long fileSize, Integer displayOrder) {
        CourseModule module = courseModuleRepository.findById(moduleId)
                .orElseThrow(() -> new RuntimeException("Module not found with id: " + moduleId));
        
        Material material = new Material();
        material.setModule(module);
        material.setCourse(module.getCourse());
        material.setTitle(title);
        material.setDescription(description);
        material.setType(com.itms.common.MaterialType.valueOf(type != null ? type : "DOCUMENT"));
        material.setFileUrl(fileUrl);
        material.setFileSize(fileSize);
        material.setDisplayOrder(displayOrder != null ? displayOrder : 0);
        material.setIsRequired(false);
        material.setIsDownloadable(true);
        material.setCreatedAt(java.time.LocalDateTime.now());
        
        Material saved = materialRepository.save(material);
        return CourseModuleDto.MaterialDto.from(saved);
    }
    
    @Transactional
    public void deleteMaterial(Long materialId) {
        if (!materialRepository.existsById(materialId)) {
            throw new RuntimeException("Material not found with id: " + materialId);
        }
        materialRepository.deleteById(materialId);
    }
}
