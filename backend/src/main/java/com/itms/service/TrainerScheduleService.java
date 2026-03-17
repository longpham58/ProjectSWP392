package com.itms.service;

import com.itms.dto.TrainerScheduleDto;
import com.itms.entity.Course;
import com.itms.entity.Session;
import com.itms.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrainerScheduleService {

    private final SessionRepository sessionRepository;

    /**
     * Get all sessions for a trainer
     */
    public List<TrainerScheduleDto> getTrainerSchedule(Integer trainerId) {
        List<Session> sessions = sessionRepository.findByTrainerId(trainerId);
        
        return sessions.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get a specific session by ID for a trainer
     */
    public TrainerScheduleDto getSessionById(Long sessionId, Integer trainerId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        
        // Verify trainer owns this session
        if (session.getTrainer() == null || !session.getTrainer().getId().equals(trainerId)) {
            throw new RuntimeException("Access denied");
        }
        
        return convertToDto(session);
    }

    /**
     * Get all courses taught by a trainer
     */
    public List<Course> getTrainerCourses(Integer trainerId) {
        return sessionRepository.getTrainerCourses(trainerId);
    }

    /**
     * Convert Session entity to TrainerScheduleDto
     */
    private TrainerScheduleDto convertToDto(Session session) {
        // Calculate session number dynamically
        Integer sessionNumber = sessionRepository.getSessionNumber(
                session.getClassRoom().getId(),
                session.getDate(),
                session.getTimeStart()
        );

        return TrainerScheduleDto.builder()
                .sessionId(session.getId())
                .sessionNumber(sessionNumber != null ? sessionNumber : 0)
                .date(session.getDate())
                .timeStart(session.getTimeStart())
                .timeEnd(session.getTimeEnd())
                .location(session.getLocation())
                .locationType(session.getLocationType())
                .meetingLink(session.getMeetingLink())
                .status(session.getStatus())
                .courseId(session.getCourse().getId())
                .courseCode(session.getCourse().getCode())
                .courseName(session.getCourse().getName())
                .classCode(session.getClassRoom() != null ? session.getClassRoom().getClassCode() : "")
                .trainerName(session.getTrainer() != null ? session.getTrainer().getFullName() : "")
                .maxCapacity(session.getMaxCapacity())
                .currentEnrolled(session.getCurrentEnrolled())
                .build();
    }
}
