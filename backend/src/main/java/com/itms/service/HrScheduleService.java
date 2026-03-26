package com.itms.service;

import com.itms.common.LocationType;
import com.itms.common.SessionStatus;
import com.itms.dto.HrScheduleDto;
import com.itms.entity.ClassRoom;
import com.itms.entity.Course;
import com.itms.entity.Session;
import com.itms.entity.User;
import com.itms.repository.ClassRoomRepository;
import com.itms.repository.CourseRepository;
import com.itms.repository.SessionRepository;
import com.itms.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class HrScheduleService {

    private final SessionRepository sessionRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final ClassRoomRepository classRoomRepository;

    public List<HrScheduleDto> getAll() {
        return sessionRepository.findAllByOrderByDateAscTimeStartAsc().stream()
                .map(this::toDto)
                .toList();
    }

    /** Return trainer(s) assigned to a course (by course code) */
    public List<java.util.Map<String, String>> getTrainersByCourse(String courseCode) {
        return courseRepository.findByCodeIgnoreCase(courseCode)
                .map(course -> {
                    if (course.getTrainer() == null) return java.util.List.<java.util.Map<String, String>>of();
                    java.util.Map<String, String> t = new java.util.HashMap<>();
                    t.put("username", course.getTrainer().getUsername());
                    t.put("fullName", course.getTrainer().getFullName());
                    return java.util.List.of(t);
                })
                .orElse(java.util.List.of());
    }

    @Transactional
    public HrScheduleDto create(HrScheduleDto dto) {
        Session session = new Session();
        applyDto(session, dto, null);
        return toDto(sessionRepository.save(session));
    }

    @Transactional
    public HrScheduleDto update(Long id, HrScheduleDto dto) {
        Session session = sessionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy lịch học với id: " + id));
        applyDto(session, dto, id);
        return toDto(sessionRepository.save(session));
    }

    @Transactional
    public void delete(Long id) {
        if (!sessionRepository.existsById(id)) {
            throw new EntityNotFoundException("Không tìm thấy lịch học với id: " + id);
        }
        sessionRepository.deleteById(id);
    }

    private void applyDto(Session session, HrScheduleDto dto, Long excludeId) {
        String trainerUsername = require(dto.getTrainerUsername(), "Vui lòng chọn trainer");
        String courseCode = require(dto.getCourseCode(), "Vui lòng chọn khóa học");
        String classCode = require(dto.getClassCode(), "Vui lòng chọn lớp");
        LocalDate date = LocalDate.parse(require(dto.getDate(), "Vui lòng chọn ngày học"));
        LocalTime startTime = LocalTime.parse(require(dto.getStartTime(), "Vui lòng chọn giờ bắt đầu"));
        LocalTime endTime = LocalTime.parse(require(dto.getEndTime(), "Vui lòng chọn giờ kết thúc"));

        if (!endTime.isAfter(startTime)) {
            throw new IllegalArgumentException("End time phải lớn hơn Start time");
        }

        Course course = courseRepository.findByCodeIgnoreCase(courseCode)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy khóa học: " + courseCode));

        if (com.itms.common.CourseStatus.INACTIVE.equals(course.getStatus())) {
            throw new IllegalArgumentException("Khóa học '" + courseCode + "' đang INACTIVE, không thể tạo lịch học");
        }

        User trainer = userRepository.findByUsername(trainerUsername)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy trainer: " + trainerUsername));

        if (course.getTrainer() == null || !course.getTrainer().getId().equals(trainer.getId())) {
            course.setTrainer(trainer);
            courseRepository.save(course);
        }

        LocationType locationType = parseLocationType(dto.getLocationType());
        String room = dto.getRoom() == null ? "" : dto.getRoom().trim();
        String meetingLink = dto.getMeetingLink() == null ? "" : dto.getMeetingLink().trim();
        String meetingPassword = dto.getMeetingPassword() == null ? "" : dto.getMeetingPassword().trim();

        if (locationType == LocationType.OFFLINE && room.isEmpty()) {
            throw new IllegalArgumentException("Vui lòng nhập phòng học");
        }
        if (locationType == LocationType.ONLINE && meetingLink.isEmpty()) {
            throw new IllegalArgumentException("Vui lòng nhập link học online");
        }

        if (sessionRepository.existsTrainerTimeConflict(trainerUsername, date, startTime, endTime, excludeId)) {
            throw new IllegalArgumentException("Trainer đã có lịch trùng giờ trong ngày này");
        }
        if (locationType == LocationType.OFFLINE
                && sessionRepository.existsRoomTimeConflict(date, room, startTime, endTime, excludeId)) {
            throw new IllegalArgumentException("Phòng học đã có lịch trùng giờ trong ngày này");
        }

        ClassRoom classRoom = classRoomRepository.findByClassCode(classCode)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy lớp học: " + classCode));

        session.setCourse(course);
        session.setTrainer(trainer);
        session.setClassRoom(classRoom);
        session.setDate(date);
        session.setTimeStart(startTime);
        session.setTimeEnd(endTime);
        session.setLocationType(locationType);
        session.setLocation(locationType == LocationType.OFFLINE ? room : "ONLINE");
        session.setMeetingLink(locationType == LocationType.ONLINE ? meetingLink : null);
        session.setMeetingPassword(locationType != LocationType.OFFLINE ? (meetingPassword.isEmpty() ? null : meetingPassword) : null);
        session.setStatus(parseStatus(dto.getStatus()));
        session.setMaxCapacity(dto.getMaxCapacity() != null ? dto.getMaxCapacity() : (session.getMaxCapacity() == null ? 100 : session.getMaxCapacity()));
        session.setCurrentEnrolled(session.getCurrentEnrolled() == null ? 0 : session.getCurrentEnrolled());
        session.setNotes(mergeClassCodeToNotes(session.getNotes(), classCode));
    }


    private SessionStatus parseStatus(String status) {
        if (status == null || status.isBlank()) {
            return SessionStatus.SCHEDULED;
        }
        try {
            return SessionStatus.valueOf(status.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            return SessionStatus.SCHEDULED;
        }
    }

    private LocationType parseLocationType(String value) {
        if (value == null || value.isBlank()) {
            return LocationType.OFFLINE;
        }
        try {
            return LocationType.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            return LocationType.OFFLINE;
        }
    }

    private HrScheduleDto toDto(Session s) {
        String classCode = s.getClassRoom() != null ? s.getClassRoom().getClassCode() : extractClassCodeFromNotes(s.getNotes());
        String trainerUsername = s.getTrainer() != null
                ? s.getTrainer().getUsername()
                : (s.getCourse() != null && s.getCourse().getTrainer() != null ? s.getCourse().getTrainer().getUsername() : "");
        String courseCode = s.getCourse() != null ? defaultString(s.getCourse().getCode()) : "";
        String courseName = s.getCourse() != null ? defaultString(s.getCourse().getName()) : "";
        String locationType = s.getLocationType() != null ? s.getLocationType().name() : "OFFLINE";

        return HrScheduleDto.builder()
                .id(s.getId())
                .trainerUsername(trainerUsername)
                .courseCode(courseCode)
                .courseName(courseName)
                .classCode(defaultString(classCode))
                .date(s.getDate() == null ? "" : s.getDate().toString())
                .startTime(s.getTimeStart() == null ? "" : s.getTimeStart().toString())
                .endTime(s.getTimeEnd() == null ? "" : s.getTimeEnd().toString())
                .room("ONLINE".equalsIgnoreCase(locationType) ? "" : defaultString(s.getLocation()))
                .locationType(locationType)
                .meetingLink(defaultString(s.getMeetingLink()))
                .meetingPassword(defaultString(s.getMeetingPassword()))
                .maxCapacity(s.getMaxCapacity())
                .currentEnrolled(s.getCurrentEnrolled())
                .status(s.getStatus() == null ? SessionStatus.SCHEDULED.name() : s.getStatus().name())
                .build();
    }

    private String mergeClassCodeToNotes(String notes, String classCode) {
        String token = "CLASS_CODE=" + classCode;
        if (notes == null || notes.isBlank()) {
            return token;
        }
        StringBuilder sb = new StringBuilder();
        boolean replaced = false;
        for (String part : notes.split(";")) {
            String trimmed = part.trim();
            if (trimmed.isEmpty()) {
                continue;
            }
            if (trimmed.regionMatches(true, 0, "CLASS_CODE=", 0, "CLASS_CODE=".length())) {
                if (!replaced) {
                    sb.append(token).append(';');
                    replaced = true;
                }
                continue;
            }
            sb.append(trimmed).append(';');
        }
        if (!replaced) {
            sb.append(token);
        } else if (sb.length() > 0 && sb.charAt(sb.length() - 1) == ';') {
            sb.setLength(sb.length() - 1);
        }
        return sb.toString();
    }

    private String extractClassCodeFromNotes(String notes) {
        if (notes == null || notes.isBlank()) {
            return null;
        }
        for (String part : notes.split(";")) {
            String token = part.trim();
            if (token.regionMatches(true, 0, "CLASS_CODE=", 0, "CLASS_CODE=".length())) {
                String value = token.substring("CLASS_CODE=".length()).trim();
                return value.isEmpty() ? null : value;
            }
        }
        return null;
    }

    private String require(String value, String message) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException(message);
        }
        return value.trim();
    }

    private String defaultString(String value) {
        return value == null ? "" : value;
    }
}
