package com.itms.service;

import com.itms.controller.TrainerController;
import com.itms.entity.ClassRoom;
import com.itms.repository.CourseScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClassRoomService {

    private final CourseScheduleRepository courseScheduleRepository;

    /**
     * Get classes by trainer ID in simple format for notifications
     */
    public List<TrainerController.SimpleCourseDto> getClassesByTrainerId(Integer trainerId) {
        List<ClassRoom> classRooms = courseScheduleRepository.findByTrainerId(trainerId).stream()
                .map(schedule -> schedule.getClassRoom())
                .filter(classRoom -> classRoom != null && classRoom.getClassCode() != null)
                .collect(Collectors.collectingAndThen(
                        Collectors.toMap(
                                ClassRoom::getClassCode,
                                classRoom -> classRoom,
                                (first, second) -> first,
                                LinkedHashMap::new
                        ),
                        map -> List.copyOf(map.values())
                ));

        return classRooms.stream()
                .map(classRoom -> new TrainerController.SimpleCourseDto(
                    classRoom.getClassCode(), 
                    classRoom.getClassName()
                ))
                .collect(Collectors.toList());
    }
}