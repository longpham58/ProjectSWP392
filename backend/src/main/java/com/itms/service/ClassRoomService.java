package com.itms.service;

import com.itms.controller.TrainerController;
import com.itms.dto.EmployeeClassDto;
import com.itms.entity.ClassMember;
import com.itms.entity.ClassRoom;
import com.itms.repository.ClassMemberRepository;
import com.itms.repository.ClassRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClassRoomService {

    private final ClassRoomRepository classRoomRepository;
    private final ClassMemberRepository classMemberRepository;

    /**
     * Get classes by trainer ID in simple format for notifications
     */
    public List<TrainerController.SimpleCourseDto> getClassesByTrainerId(Integer trainerId) {
        List<ClassRoom> classRooms = classRoomRepository.findByTrainerId(trainerId);
        
        return classRooms.stream()
                .map(classRoom -> new TrainerController.SimpleCourseDto(
                    classRoom.getClassCode(), 
                    classRoom.getClassName()
                ))
                .collect(Collectors.toList());
    }
    
    /**
     * Get classes for an employee (user) with member information
     */
    public List<EmployeeClassDto> getClassesByUserId(Integer userId) {
        List<ClassMember> classMembers = classMemberRepository.findByUserId(userId);
        
        return classMembers.stream()
                .map(member -> {
                    ClassRoom classRoom = member.getClassRoom();
                    return EmployeeClassDto.builder()
                            .classId(classRoom.getId())
                            .classCode(classRoom.getClassCode())
                            .className(classRoom.getClassName())
                            .courseName(classRoom.getCourse() != null ? classRoom.getCourse().getCourseName() : null)
                            .courseCode(classRoom.getCourse() != null ? classRoom.getCourse().getCourseCode() : null)
                            .trainerName(classRoom.getTrainer() != null ? classRoom.getTrainer().getFullName() : null)
                            .maxStudents(classRoom.getMaxStudents())
                            .currentStudents(classRoom.getClassMembers() != null ? classRoom.getClassMembers().size() : 0)
                            .status(classRoom.getStatus())
                            .notes(classRoom.getNotes())
                            .joinedAt(member.getJoinedAt())
                            .build();
                })
                .collect(Collectors.toList());
    }
}