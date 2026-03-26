package com.itms.service;

import com.itms.common.Grade;
import com.itms.dto.CertificateDto;
import com.itms.dto.CourseCompletionDto;
import com.itms.entity.*;
import com.itms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class CertificateService {
    private final CertificateRepository certificateRepository;
    private final SessionRepository sessionRepository;
    private final AttendanceRepository attendanceRepository;
    private final ClassRoomRepository classRoomRepository;
    private final ClassMemberRepository classMemberRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public List<CertificateDto> getCertificatesByUser(Integer userId) {
        List<Certificate> certificates = certificateRepository.findByUserId(userId);
        return certificates.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Auto-issue certificate when a student completes all sessions of a course.
     * Called after trainer saves attendance.
     *
     * Criteria:
     *  - Student attended >= passingAttendanceRate (default 70%) of all sessions in the class
     *  - No existing certificate for this user+course
     *
     * Score is calculated as: (attendedSessions / totalSessions) * 100
     */
    @Transactional
    public void tryIssueCertificateOnCourseCompletion(User student, Course course,
                                                       Integer classRoomId, User issuedBy) {
        // Skip if certificate already exists
        boolean alreadyExists = certificateRepository.findByUserId(student.getId())
                .stream().anyMatch(c -> c.getCourse().getId().equals(course.getId()));
        if (alreadyExists) {
            log.debug("Certificate already exists for user={} course={}", student.getId(), course.getId());
            return;
        }

        // Get all sessions for this class
        List<com.itms.entity.Session> allSessions =
                sessionRepository.findByClassRoomIdOrderByDateAsc(classRoomId);
        int totalSessions = allSessions.size();
        if (totalSessions == 0) return;

        // Count sessions this student attended
        List<Long> sessionIds = allSessions.stream()
                .map(com.itms.entity.Session::getId)
                .collect(Collectors.toList());
        int attendedSessions = attendanceRepository
                .countByUserIdAndSessionIds(student.getId(), sessionIds);

        // Attendance rate as score (0-100)
        double attendanceRate = (attendedSessions * 100.0) / totalSessions;

        // Passing threshold: use course passingScore if set, else default 70%
        double passingThreshold = course.getPassingScore() != null ? course.getPassingScore() : 70.0;

        if (attendanceRate < passingThreshold) {
            log.info("User {} did not meet passing threshold for course {} (rate={}%, required={}%)",
                    student.getId(), course.getId(), attendanceRate, passingThreshold);
            return;
        }

        BigDecimal score = BigDecimal.valueOf(attendanceRate).setScale(2, RoundingMode.HALF_UP);
        Grade grade;
        if (attendanceRate >= 90) grade = Grade.DISTINCTION;
        else if (attendanceRate >= 75) grade = Grade.MERIT;
        else grade = Grade.PASS;

        Certificate cert = Certificate.builder()
                .user(student)
                .course(course)
                .certificateCode("CERT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .issueDate(LocalDate.now())
                .expiryDate(LocalDate.now().plusYears(2))
                .score(score)
                .grade(grade)
                .issuedBy(issuedBy)
                .isValid(true)
                .build();

        certificateRepository.save(cert);
        log.info("Certificate issued for user={} course={} grade={} score={}",
                student.getId(), course.getId(), grade, score);
    }

    /**
     * HR: Get all completed/ended courses with student completion status.
     * A course is "ended" if endDate <= today OR status is INACTIVE/ARCHIVED.
     */
    public List<CourseCompletionDto> getCompletedCoursesForHr() {
        List<Course> allCourses = courseRepository.findAll();
        LocalDate today = LocalDate.now();

        return allCourses.stream()
                .filter(c -> isEnded(c, today))
                .map(course -> buildCourseCompletionDto(course))
                .collect(Collectors.toList());
    }

    /**
     * HR: Issue certificates to all eligible students of a course.
     * Eligible = attended >= passingScore% of sessions, no existing certificate.
     */
    @Transactional
    public int issueCertificatesForCourse(Integer courseId, Integer issuedById) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found: " + courseId));
        User issuedBy = userRepository.findById(issuedById)
                .orElseThrow(() -> new RuntimeException("User not found: " + issuedById));

        List<ClassRoom> classRooms = classRoomRepository.findByCourseId(courseId);
        int issued = 0;

        for (ClassRoom classRoom : classRooms) {
            List<Session> allSessions = sessionRepository.findByClassRoomIdOrderByDateAsc(classRoom.getId());
            if (allSessions.isEmpty()) continue;

            List<Long> sessionIds = allSessions.stream().map(Session::getId).collect(Collectors.toList());
            int totalSessions = allSessions.size();
            double passingThreshold = course.getPassingScore() != null ? course.getPassingScore() : 70.0;

            List<ClassMember> members = classMemberRepository.findByClassRoomId(classRoom.getId());
            for (ClassMember member : members) {
                User student = member.getUser();

                // Skip if already has certificate
                boolean alreadyExists = certificateRepository.findByUserId(student.getId())
                        .stream().anyMatch(c -> c.getCourse().getId().equals(courseId));
                if (alreadyExists) continue;

                int attended = attendanceRepository.countByUserIdAndSessionIds(student.getId(), sessionIds);
                double rate = (attended * 100.0) / totalSessions;
                if (rate < passingThreshold) continue;

                BigDecimal score = BigDecimal.valueOf(rate).setScale(2, RoundingMode.HALF_UP);
                Grade grade = rate >= 90 ? Grade.DISTINCTION : rate >= 75 ? Grade.MERIT : Grade.PASS;

                Certificate cert = Certificate.builder()
                        .user(student)
                        .course(course)
                        .certificateCode("CERT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                        .issueDate(LocalDate.now())
                        .expiryDate(LocalDate.now().plusYears(2))
                        .score(score)
                        .grade(grade)
                        .issuedBy(issuedBy)
                        .isValid(true)
                        .build();

                certificateRepository.save(cert);
                issued++;
                log.info("HR issued certificate for user={} course={} grade={}", student.getId(), courseId, grade);
            }
        }
        return issued;
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private boolean isEnded(Course course, LocalDate today) {
        if (course.getEndDate() != null && !course.getEndDate().isAfter(today)) return true;
        if (course.getStatus() != null) {
            String s = course.getStatus().name();
            return s.equals("INACTIVE") || s.equals("ARCHIVED");
        }
        return false;
    }

    private CourseCompletionDto buildCourseCompletionDto(Course course) {
        List<ClassRoom> classRooms = classRoomRepository.findByCourseId(course.getId());
        double passingThreshold = course.getPassingScore() != null ? course.getPassingScore() : 70.0;

        List<CourseCompletionDto.StudentCompletionDto> studentDtos = new ArrayList<>();

        for (ClassRoom classRoom : classRooms) {
            List<Session> allSessions = sessionRepository.findByClassRoomIdOrderByDateAsc(classRoom.getId());
            int totalSessions = allSessions.size();
            List<Long> sessionIds = allSessions.stream().map(Session::getId).collect(Collectors.toList());

            List<ClassMember> members = classMemberRepository.findByClassRoomId(classRoom.getId());
            for (ClassMember member : members) {
                User student = member.getUser();
                int attended = totalSessions > 0
                        ? attendanceRepository.countByUserIdAndSessionIds(student.getId(), sessionIds)
                        : 0;
                double rate = totalSessions > 0 ? (attended * 100.0) / totalSessions : 0;
                boolean eligible = rate >= passingThreshold;
                boolean hasCert = certificateRepository.findByUserId(student.getId())
                        .stream().anyMatch(c -> c.getCourse().getId().equals(course.getId()));

                studentDtos.add(CourseCompletionDto.StudentCompletionDto.builder()
                        .userId(student.getId())
                        .username(student.getUsername())
                        .fullName(student.getFullName())
                        .email(student.getEmail())
                        .attendedSessions(attended)
                        .totalSessions(totalSessions)
                        .attendanceRate(Math.round(rate * 10.0) / 10.0)
                        .eligible(eligible)
                        .hasCertificate(hasCert)
                        .build());
            }
        }

        long eligible = studentDtos.stream().filter(CourseCompletionDto.StudentCompletionDto::isEligible).count();
        long certified = studentDtos.stream().filter(CourseCompletionDto.StudentCompletionDto::isHasCertificate).count();

        return CourseCompletionDto.builder()
                .courseId(course.getId())
                .courseCode(course.getCode())
                .courseName(course.getName())
                .courseCategory(course.getCategory())
                .endDate(course.getEndDate())
                .status(course.getStatus() != null ? course.getStatus().name() : null)
                .totalStudents(studentDtos.size())
                .eligibleStudents((int) eligible)
                .alreadyCertified((int) certified)
                .students(studentDtos)
                .build();
    }

    private CertificateDto mapToDto(Certificate certificate) {
        return CertificateDto.builder()
                .id(certificate.getId())
                .courseId(certificate.getCourse().getId())
                .courseName(certificate.getCourse().getName())
                .courseCategory(certificate.getCourse().getCategory())
                .studentName(certificate.getUser().getFullName())
                .trainerName(certificate.getCourse().getTrainer() != null
                        ? certificate.getCourse().getTrainer().getFullName() : null)
                .certificateCode(certificate.getCertificateCode())
                .completionDate(certificate.getIssueDate())
                .issueDate(certificate.getIssueDate())
                .grade(certificate.getGrade() != null ? certificate.getGrade().name() : null)
                .score(certificate.getScore() != null ? certificate.getScore().doubleValue() : null)
                .instructor(certificate.getIssuedBy() != null
                        ? certificate.getIssuedBy().getFullName() : null)
                .certificateUrl(certificate.getCertificateUrl())
                .isValid(certificate.getIsValid())
                .build();
    }
}
