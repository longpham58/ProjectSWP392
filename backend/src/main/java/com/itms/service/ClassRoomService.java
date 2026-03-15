package com.itms.service;

import com.itms.controller.TrainerController;
import com.itms.entity.ClassRoom;
import com.itms.repository.ClassRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClassRoomService {

    private final ClassRoomRepository classRoomRepository;

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
}