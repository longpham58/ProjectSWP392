package com.itms.service;

import com.itms.common.EnrollmentStatus;
import com.itms.common.LocationType;
import com.itms.common.SessionStatus;
import com.itms.controller.TrainerController;
import com.itms.dto.ClassAttendanceDto;
import com.itms.entity.*;
import com.itms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class TrainerAttendanceService {

    private final ClassRoomRepository classRoomRepository;
    private final ClassMemberRepository classMemberRepository;
    private final SessionRepository sessionRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final AttendanceRepository attendanceRepository;
    private final CourseScheduleRepository courseScheduleRepository;
    private final UserRepository userRepository;

    /**
     * Get classes that have a session TODAY for this trainer.
     * Queries Session table directly so all scheduled sessions appear.
     */
    public List<ClassAttendanceDto> getTodayClasses(Integer trainerId) {
        LocalDate today = LocalDate.now();

        // Find all sessions today for this trainer
        List<Session> todaySessions = sessionRepository.findByTrainerId(trainerId)
                .stream()
                .filter(s -> today.equals(s.getDate()))
                .collect(Collectors.toList());

        // Deduplicate by classCode
        return todaySessions.stream()
                .filter(s -> s.getClassRoom() != null)
                .collect(Collectors.toMap(
                        s -> s.getClassRoom().getClassCode(),
                        s -> ClassAttendanceDto.builder()
                                .classCode(s.getClassRoom().getClassCode())
                                .className(s.getClassRoom().getClassName())
                                .date(today)
                                .build(),
                        (a, b) -> a
                ))
                .values()
                .stream()
                .collect(Collectors.toList());
    }

    /**
     * Get list of students with their attendance status for a class on a specific date.
     */
    public ClassAttendanceDto getClassAttendance(String classCode, LocalDate date) {
        ClassRoom classRoom = classRoomRepository.findByClassCodeWithCourse(classCode)
                .orElseThrow(() -> new RuntimeException("Lớp học không tồn tại: " + classCode));

        List<ClassMember> members = classMemberRepository.findByClassRoomClassCode(classCode);

        Optional<Session> sessionOpt = sessionRepository
                .findByClassRoomIdAndDate(classRoom.getId(), date);

        List<ClassAttendanceDto.StudentAttendanceDto> students = members.stream().map(member -> {
            Boolean attended = null;
            String notes = null;

            if (sessionOpt.isPresent()) {
                Optional<Enrollment> enrollOpt = enrollmentRepository
                        .findByUserIdAndSessionId(member.getUser().getId(), sessionOpt.get().getId());
                if (enrollOpt.isPresent()) {
                    Optional<Attendance> attOpt = attendanceRepository
                            .findByEnrollmentId(enrollOpt.get().getId());
                    if (attOpt.isPresent()) {
                        attended = attOpt.get().getAttended();
                        notes = attOpt.get().getNotes();
                    }
                }
            }

            return ClassAttendanceDto.StudentAttendanceDto.builder()
                    .userId(member.getUser().getId())
                    .fullName(member.getUser().getFullName())
                    .email(member.getUser().getEmail())
                    .attended(attended)
                    .notes(notes)
                    .build();
        }).collect(Collectors.toList());

        return ClassAttendanceDto.builder()
                .classCode(classRoom.getClassCode())
                .className(classRoom.getClassName())
                .date(date)
                .students(students)
                .build();
    }

    /**
     * Save attendance for a class on a specific date.
     * Creates Session, Enrollment, and Attendance records as needed.
     */
    @Transactional
    public void saveClassAttendance(String classCode, LocalDate date,
                                    List<TrainerController.StudentAttendanceItem> updates,
                                    Integer trainerId) {
        log.info("saveClassAttendance: classCode={}, date={}, trainerId={}, students={}",
                classCode, date, trainerId, updates != null ? updates.size() : 0);

        if (!date.equals(LocalDate.now())) {
            throw new RuntimeException("Chỉ có thể điểm danh trong ngày hôm nay");
        }

        ClassRoom classRoom = classRoomRepository.findByClassCodeWithCourse(classCode)
                .orElseThrow(() -> new RuntimeException("Lớp học không tồn tại: " + classCode));
        log.info("Found classRoom id={}", classRoom.getId());

        User trainer = userRepository.getReferenceById(trainerId);

        Session session = sessionRepository.findByClassRoomIdAndDate(classRoom.getId(), date)
                .orElseGet(() -> {
                    log.info("No session found, creating new session for classRoom={} date={}", classRoom.getId(), date);
                    return createSession(classRoom, date, trainer);
                });
        log.info("Session id={}", session.getId());

        for (TrainerController.StudentAttendanceItem update : updates) {
            log.info("Processing student userId={}", update.getUserId());
            User student = userRepository.getReferenceById(update.getUserId());

            Enrollment enrollment = enrollmentRepository
                    .findByUserIdAndSessionId(update.getUserId(), session.getId())
                    .orElseGet(() -> {
                        log.info("Creating enrollment for userId={} sessionId={}", update.getUserId(), session.getId());
                        return createEnrollment(student, session);
                    });
            log.info("Enrollment id={}", enrollment.getId());

            Attendance attendance = attendanceRepository.findByEnrollmentId(enrollment.getId())
                    .orElseGet(() -> {
                        Attendance a = new Attendance();
                        a.setEnrollment(enrollment);
                        a.setCreatedAt(LocalDateTime.now());
                        return a;
                    });

            boolean isPresent = Boolean.TRUE.equals(update.getAttended());
            attendance.setAttended(isPresent);
            attendance.setNotes(update.getNotes());
            attendance.setMarkedBy(trainer);
            attendance.setUpdatedAt(LocalDateTime.now());
            if (isPresent && attendance.getCheckInTime() == null) {
                attendance.setCheckInTime(LocalDateTime.now());
            }
            attendance.setCompletionStatus(isPresent ? "COMPLETED" : "ABSENT");

            attendanceRepository.save(attendance);
            log.info("Saved attendance for userId={}", update.getUserId());
        }
        log.info("saveClassAttendance completed successfully");
    }

    private Session createSession(ClassRoom classRoom, LocalDate date, User trainer) {
        String dayOfWeek = date.getDayOfWeek().name().substring(0, 3).toUpperCase();
        List<CourseSchedule> schedules = courseScheduleRepository.findByClassRoomId(classRoom.getId())
                .stream()
                .filter(s -> s.getDayOfWeek() != null &&
                        s.getDayOfWeek().equalsIgnoreCase(dayOfWeek))
                .collect(Collectors.toList());

        LocalTime timeStart = schedules.isEmpty() ? LocalTime.of(8, 0) : schedules.get(0).getTimeStart();
        LocalTime timeEnd = schedules.isEmpty() ? LocalTime.of(10, 0) : schedules.get(0).getTimeEnd();
        String location = schedules.isEmpty() ? "" : schedules.get(0).getLocation();

        Session session = new Session();
        session.setCourse(classRoom.getCourse());
        session.setClassRoom(classRoom);
        session.setTrainer(trainer);
        session.setDate(date);
        session.setTimeStart(timeStart);
        session.setTimeEnd(timeEnd);
        session.setLocation(location);
        session.setLocationType(LocationType.OFFLINE);
        session.setStatus(SessionStatus.COMPLETED);
        session.setMaxCapacity(classRoom.getMaxStudents() != null ? classRoom.getMaxStudents() : 30);
        session.setCurrentEnrolled(0);
        session.setCreatedAt(LocalDateTime.now());
        return sessionRepository.save(session);
    }

    private Enrollment createEnrollment(User student, Session session) {
        Enrollment enrollment = new Enrollment();
        enrollment.setUser(student);
        enrollment.setSession(session);
        enrollment.setStatus(EnrollmentStatus.APPROVED);
        enrollment.setRegisteredAt(LocalDateTime.now());
        enrollment.setCreatedAt(LocalDateTime.now());
        return enrollmentRepository.save(enrollment);
    }
}
