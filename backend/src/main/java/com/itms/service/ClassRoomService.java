package com.itms.service;

import com.itms.controller.TrainerController;
import com.itms.dto.EmployeeClassDto;
import com.itms.entity.ClassMember;
import com.itms.entity.ClassRoom;
import com.itms.repository.ClassMemberRepository;
import com.itms.repository.ClassRoomRepository;
import com.itms.repository.CourseScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClassRoomService {

    private final CourseScheduleRepository courseScheduleRepository;
    private final ClassMemberRepository classMemberRepository;
    private final ClassRoomRepository classRoomRepository;

    /**
     * Get classes by trainer ID in simple format for notifications.
     * Finds classes where trainer is assigned directly OR via course.
     */
    public List<TrainerController.SimpleCourseDto> getClassesByTrainerId(Integer trainerId) {
        List<ClassRoom> classRooms = classRoomRepository.findByTrainerIdWithCourse(trainerId);

        return classRooms.stream()
                .filter(cls -> cls.getClassCode() != null)
                .map(cls -> new TrainerController.SimpleCourseDto(
                        cls.getClassCode(),
                        cls.getClassName() != null ? cls.getClassName() : cls.getClassCode()
                ))
                .collect(Collectors.toList());
    }

    /**
     * Get classes by user ID (classes the user is enrolled in)
     */
    public List<EmployeeClassDto> getClassesByUserId(Integer userId) {
        List<ClassMember> classMembers = classMemberRepository.findByUserId(userId);
        
        return classMembers.stream()
                .map(cm -> {
                    ClassRoom classRoom = cm.getClassRoom();
                    return EmployeeClassDto.builder()
                            .classId(classRoom.getId())
                            .classCode(classRoom.getClassCode())
                            .className(classRoom.getClassName())
                            .courseName(classRoom.getCourse() != null ? classRoom.getCourse().getName() : null)
                            .courseCode(classRoom.getCourse() != null ? classRoom.getCourse().getCode() : null)
                            .trainerName(classRoom.getTrainer() != null ? classRoom.getTrainer().getFullName() : null)
                            .maxStudents(classRoom.getMaxStudents())
                            .status(cm.getStatus())
                            .notes(cm.getNotes())
                            .joinedAt(cm.getJoinedAt())
                            .build();
                })
                .collect(Collectors.toList());
    }
}