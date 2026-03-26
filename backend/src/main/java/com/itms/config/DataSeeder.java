package com.itms.config;

import com.itms.common.LocationType;
import com.itms.common.SessionStatus;
import com.itms.entity.*;
import com.itms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder {

    private final PasswordEncoder passwordEncoder;

    // Set true to wipe and re-seed all data on next startup
    private static final boolean RESET_DATA = true;

    @Bean
    CommandLineRunner seedData(
            DepartmentRepository departmentRepository,
            UserRepository userRepository,
            RoleRepository roleRepository,
            UserRoleRepository userRoleRepository,
            CourseScheduleRepository courseScheduleRepository,
            SessionRepository sessionRepository,
            EnrollmentRepository enrollmentRepository,
            AttendanceRepository attendanceRepository,
            FeedbackRepository feedbackRepository,
            QuizAttemptRepository quizAttemptRepository,
            NotificationRepository notificationRepository,
            CertificateRepository certificateRepository,
            MaterialRepository materialRepository,
            UserModuleProgressRepository userModuleProgressRepository,
            ClassMemberRepository classMemberRepository,
            QuizRepository quizRepository,
            CourseRepository courseRepository,
            ClassRoomRepository classRoomRepository,
            CourseModuleRepository courseModuleRepository
    ) {
        return args -> {
            if (!RESET_DATA) {
                System.out.println("Data reset disabled. Skipping...");
                return;
            }

            System.out.println("Resetting all data...");

            // Delete in FK-safe order
            attendanceRepository.deleteAll();
            feedbackRepository.deleteAll();
            quizAttemptRepository.deleteAll();
            certificateRepository.deleteAll();
            enrollmentRepository.deleteAll();
            sessionRepository.deleteAll();
            notificationRepository.deleteAll();
            userModuleProgressRepository.deleteAll();
            classMemberRepository.deleteAll();
            materialRepository.deleteAll();
            quizRepository.deleteAll();
            courseScheduleRepository.deleteAll();
            courseModuleRepository.deleteAll();
            courseRepository.deleteAll();
            classRoomRepository.deleteAll();
            userRoleRepository.deleteAll();
            userRepository.deleteAll();
            departmentRepository.deleteAll();
            roleRepository.deleteAll();

            System.out.println("All data reset complete");

            // ── Roles ────────────────────────────────────────────────────────
            Role adminRole    = saveRole(roleRepository, "Administrator", "ADMIN",    "Full system access");
            Role hrRole       = saveRole(roleRepository, "Human Resources", "HR",     "Manage training programs");
            Role trainerRole  = saveRole(roleRepository, "Trainer",  "TRAINER",       "Conduct training sessions");
            Role employeeRole = saveRole(roleRepository, "Employee", "EMPLOYEE",      "Access training courses");

            // ── Departments ──────────────────────────────────────────────────
            Department it      = saveDept(departmentRepository, "IT Department",      "IT",    "Information Technology");
            Department hrDept  = saveDept(departmentRepository, "HR Department",      "HR",    "Human Resources");
            Department finance = saveDept(departmentRepository, "Finance Department", "FIN",   "Finance and Accounting");
            Department sales   = saveDept(departmentRepository, "Sales Department",   "SALES", "Sales and Marketing");

            // ── Users ────────────────────────────────────────────────────────
            String pw = passwordEncoder.encode("admin123");

            User admin    = saveUser(userRepository, "admin",      "admin@itms.com",       "System Administrator",  "0905123456", it,      pw);
            User hrUser   = saveUser(userRepository, "hr001",      "hr@itms.com",          "Nguyễn Văn HR",         "0905123457", hrDept,  pw);
            User t1       = saveUser(userRepository, "trainer001", "trainer@itms.com",     "Trần Thị Trainer",      "0905123458", it,      pw);
            User t2       = saveUser(userRepository, "trainer002", "trainer002@itms.com",  "Nguyễn Văn Trainer",    "0905123464", it,      pw);
            User t3       = saveUser(userRepository, "trainer003", "trainer003@itms.com",  "Phạm Thị Trainer",      "0905123465", sales,   pw);
            User t4       = saveUser(userRepository, "trainer004", "trainer004@itms.com",  "Lê Văn Trainer",        "0905123466", finance, pw);
            User t5       = saveUser(userRepository, "trainer005", "trainer005@itms.com",  "Trần Văn Trainer",      "0905123467", hrDept,  pw);
            User emp1     = saveUser(userRepository, "emp001",     "employee@itms.com",    "Lê Văn Employee",       "0905123459", finance, pw);
            User emp2     = saveUser(userRepository, "emp002",     "employee2@itms.com",   "Phạm Thị Mai",          "0905123460", sales,   pw);
            User emp3     = saveUser(userRepository, "emp003",     "emp003@itms.com",      "Nguyễn Văn A",          "0905123461", it,      pw);
            User emp4     = saveUser(userRepository, "emp004",     "emp004@itms.com",      "Trần Thị B",            "0905123462", hrDept,  pw);
            User emp5     = saveUser(userRepository, "emp005",     "emp005@itms.com",      "Lê Văn C",              "0905123463", finance, pw);

            // ── Roles assignment ─────────────────────────────────────────────
            assignRole(userRoleRepository, admin,  adminRole,    admin);
            assignRole(userRoleRepository, hrUser, hrRole,       admin);
            assignRole(userRoleRepository, t1,     trainerRole,  admin);
            assignRole(userRoleRepository, t1,     employeeRole, admin);
            assignRole(userRoleRepository, t2,     trainerRole,  admin);
            assignRole(userRoleRepository, t3,     trainerRole,  admin);
            assignRole(userRoleRepository, t4,     trainerRole,  admin);
            assignRole(userRoleRepository, t5,     trainerRole,  admin);
            assignRole(userRoleRepository, emp1,   employeeRole, admin);
            assignRole(userRoleRepository, emp2,   employeeRole, admin);
            assignRole(userRoleRepository, emp3,   employeeRole, admin);
            assignRole(userRoleRepository, emp4,   employeeRole, admin);
            assignRole(userRoleRepository, emp5,   employeeRole, admin);

            // ── Courses (still-active) ────────────────────────────────────────
            LocalDate today = LocalDate.now();

            Course javaCourse   = saveCourse(courseRepository, "JAVA001",   "Java Programming Fundamentals",
                    "Learn Java from basics to advanced", "Basic programming", 40.0, t1, admin,
                    today.minusMonths(1), today.plusMonths(2), "Programming", 70.0);

            Course springCourse = saveCourse(courseRepository, "SPRING001", "Spring Boot Development",
                    "Master Spring Boot for enterprise apps", "Java experience", 60.0, t2, admin,
                    today.minusMonths(1), today.plusMonths(3), "Programming", 70.0);

            Course reactCourse  = saveCourse(courseRepository, "REACT001",  "React Frontend Development",
                    "Build modern web apps with React", "JavaScript knowledge", 45.0, t3, admin,
                    today.minusMonths(1), today.plusMonths(2), "Frontend", 70.0);

            Course sqlCourse    = saveCourse(courseRepository, "SQL001",    "Database Management with SQL",
                    "Learn SQL for database operations", "Basic computer skills", 30.0, t4, admin,
                    today.minusMonths(1), today.plusMonths(2), "Database", 70.0);

            Course pythonCourse = saveCourse(courseRepository, "PYTHON001", "Python Programming",
                    "Introduction to Python", "No prior experience required", 35.0, t5, admin,
                    today.minusMonths(1), today.plusMonths(2), "Programming", 70.0);

            // ── NEW: DevOps course — already ENDED (endDate in the past) ─────
            Course devopsCourse = saveCourse(courseRepository, "DEVOPS001", "DevOps & CI/CD Fundamentals",
                    "Learn Docker, Jenkins, GitHub Actions and deployment pipelines",
                    "Basic Linux knowledge", 50.0, t1, admin,
                    today.minusMonths(3), today.minusDays(7),   // ended 7 days ago
                    "DevOps", 70.0);

            // ── ClassRooms ───────────────────────────────────────────────────
            ClassRoom javaClass1   = saveClass(classRoomRepository, "JAVA001-2024-01",   "Java Class Spring 2024",    javaCourse,   t1, 25, admin);
            ClassRoom javaClass2   = saveClass(classRoomRepository, "JAVA001-2024-02",   "Java Class Summer 2024",    javaCourse,   t1, 30, admin);
            ClassRoom springClass1 = saveClass(classRoomRepository, "SPRING001-2024-01", "Spring Boot Class 2024",    springCourse, t2, 20, admin);
            ClassRoom reactClass1  = saveClass(classRoomRepository, "REACT001-2024-01",  "React Development Class",   reactCourse,  t3, 25, admin);
            ClassRoom sqlClass1    = saveClass(classRoomRepository, "SQL001-2024-01",    "SQL Database Class",        sqlCourse,    t4, 30, admin);
            ClassRoom pythonClass1 = saveClass(classRoomRepository, "PYTHON001-2024-01", "Python Programming Class",  pythonCourse, t5, 25, admin);
            ClassRoom devopsClass1 = saveClass(classRoomRepository, "DEVOPS001-2024-01", "DevOps Batch 2024",         devopsCourse, t1, 20, admin);

            // ── ClassMembers ─────────────────────────────────────────────────
            addMember(classMemberRepository, javaClass1,   emp1, admin);
            addMember(classMemberRepository, javaClass1,   emp2, admin);
            addMember(classMemberRepository, javaClass1,   emp3, admin);
            addMember(classMemberRepository, javaClass2,   emp4, admin);
            addMember(classMemberRepository, javaClass2,   emp5, admin);
            addMember(classMemberRepository, springClass1, emp1, admin);
            addMember(classMemberRepository, springClass1, emp3, admin);
            addMember(classMemberRepository, springClass1, emp5, admin);
            addMember(classMemberRepository, reactClass1,  emp2, admin);
            addMember(classMemberRepository, reactClass1,  emp4, admin);
            addMember(classMemberRepository, sqlClass1,    emp1, admin);
            addMember(classMemberRepository, sqlClass1,    emp2, admin);
            addMember(classMemberRepository, sqlClass1,    emp3, admin);
            addMember(classMemberRepository, sqlClass1,    emp4, admin);
            addMember(classMemberRepository, pythonClass1, emp3, admin);
            addMember(classMemberRepository, pythonClass1, emp5, admin);

            // DevOps class: emp1, emp2, emp3, emp4 enrolled
            addMember(classMemberRepository, devopsClass1, emp1, admin);
            addMember(classMemberRepository, devopsClass1, emp2, admin);
            addMember(classMemberRepository, devopsClass1, emp3, admin);
            addMember(classMemberRepository, devopsClass1, emp4, admin);

            // ── CourseSchedules (active courses) ─────────────────────────────
            saveSchedule(courseScheduleRepository, javaCourse,   javaClass1,   t1, "MON", LocalTime.of(8,0),  LocalTime.of(10,0), "Phòng 101", admin);
            saveSchedule(courseScheduleRepository, javaCourse,   javaClass1,   t1, "WED", LocalTime.of(8,0),  LocalTime.of(10,0), "Phòng 101", admin);
            saveSchedule(courseScheduleRepository, javaCourse,   javaClass2,   t1, "TUE", LocalTime.of(13,0), LocalTime.of(15,0), "Phòng 102", admin);
            saveSchedule(courseScheduleRepository, javaCourse,   javaClass2,   t1, "THU", LocalTime.of(13,0), LocalTime.of(15,0), "Phòng 102", admin);
            saveSchedule(courseScheduleRepository, springCourse, springClass1, t2, "TUE", LocalTime.of(8,0),  LocalTime.of(10,0), "Phòng 201", admin);
            saveSchedule(courseScheduleRepository, springCourse, springClass1, t2, "FRI", LocalTime.of(8,0),  LocalTime.of(10,0), "Phòng 201", admin);
            saveSchedule(courseScheduleRepository, reactCourse,  reactClass1,  t3, "WED", LocalTime.of(13,0), LocalTime.of(15,0), "Phòng 301", admin);
            saveSchedule(courseScheduleRepository, reactCourse,  reactClass1,  t3, "SAT", LocalTime.of(8,0),  LocalTime.of(10,0), "Phòng 301", admin);
            saveSchedule(courseScheduleRepository, sqlCourse,    sqlClass1,    t4, "MON", LocalTime.of(13,0), LocalTime.of(15,0), "Phòng 401", admin);
            saveSchedule(courseScheduleRepository, sqlCourse,    sqlClass1,    t4, "THU", LocalTime.of(8,0),  LocalTime.of(10,0), "Phòng 401", admin);
            saveSchedule(courseScheduleRepository, pythonCourse, pythonClass1, t5, "WED", LocalTime.of(8,0),  LocalTime.of(10,0), "Phòng 501", admin);
            saveSchedule(courseScheduleRepository, pythonCourse, pythonClass1, t5, "FRI", LocalTime.of(13,0), LocalTime.of(15,0), "Phòng 501", admin);

            // ── DevOps: 6 completed sessions (in the past) ───────────────────
            // Week 1
            Session d1 = saveSession(sessionRepository, devopsCourse, devopsClass1, t1,
                    today.minusWeeks(10), LocalTime.of(8,0), LocalTime.of(10,0), "Phòng 601", admin);
            Session d2 = saveSession(sessionRepository, devopsCourse, devopsClass1, t1,
                    today.minusWeeks(9).plusDays(2), LocalTime.of(8,0), LocalTime.of(10,0), "Phòng 601", admin);
            Session d3 = saveSession(sessionRepository, devopsCourse, devopsClass1, t1,
                    today.minusWeeks(8), LocalTime.of(8,0), LocalTime.of(10,0), "Phòng 601", admin);
            Session d4 = saveSession(sessionRepository, devopsCourse, devopsClass1, t1,
                    today.minusWeeks(7).plusDays(2), LocalTime.of(8,0), LocalTime.of(10,0), "Phòng 601", admin);
            Session d5 = saveSession(sessionRepository, devopsCourse, devopsClass1, t1,
                    today.minusWeeks(6), LocalTime.of(8,0), LocalTime.of(10,0), "Phòng 601", admin);
            Session d6 = saveSession(sessionRepository, devopsCourse, devopsClass1, t1,
                    today.minusWeeks(5).plusDays(2), LocalTime.of(8,0), LocalTime.of(10,0), "Phòng 601", admin);

            List<Session> devopsSessions = List.of(d1, d2, d3, d4, d5, d6);

            // ── Attendance for DevOps ─────────────────────────────────────────
            // emp1: attended all 6 → 100% → DISTINCTION
            // emp2: attended 5/6  → 83%  → MERIT
            // emp3: attended 4/6  → 67%  → below threshold (no cert)
            // emp4: attended 6/6  → 100% → DISTINCTION

            seedAttendance(enrollmentRepository, attendanceRepository,
                    emp1, devopsSessions, new boolean[]{true, true, true, true, true, true}, t1);
            seedAttendance(enrollmentRepository, attendanceRepository,
                    emp2, devopsSessions, new boolean[]{true, true, true, true, true, false}, t1);
            seedAttendance(enrollmentRepository, attendanceRepository,
                    emp3, devopsSessions, new boolean[]{true, true, true, true, false, false}, t1);
            seedAttendance(enrollmentRepository, attendanceRepository,
                    emp4, devopsSessions, new boolean[]{true, true, true, true, true, true}, t1);

            System.out.println("ITMS seed data completed successfully");
            System.out.println("Total courses: "    + courseRepository.count());
            System.out.println("Total classrooms: " + classRoomRepository.count());
            System.out.println("Total sessions: "   + sessionRepository.count());
            System.out.println("Total enrollments: "+ enrollmentRepository.count());
            System.out.println("Total attendance: " + attendanceRepository.count());
        };
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private Role saveRole(RoleRepository repo, String name, String code, String desc) {
        return repo.save(Role.builder()
                .roleName(name).roleCode(code).description(desc)
                .isActive(true).createdAt(LocalDateTime.now())
                .build());
    }

    private Department saveDept(DepartmentRepository repo, String name, String code, String desc) {
        return repo.save(Department.builder()
                .name(name).code(code).description(desc)
                .isActive(true).createdAt(LocalDateTime.now())
                .build());
    }

    private User saveUser(UserRepository repo, String username, String email,
                          String fullName, String phone, Department dept, String password) {
        return repo.save(User.builder()
                .username(username).email(email).fullName(fullName)
                .phone(phone).department(dept).password(password)
                .isActive(true).otpEnabled(false).createdAt(LocalDateTime.now())
                .build());
    }

    private void assignRole(UserRoleRepository repo, User user, Role role, User by) {
        UserRole ur = UserRole.builder()
                .user(user).role(role).assignedBy(by).isActive(true).build();
        repo.save(ur);
    }

    private Course saveCourse(CourseRepository repo,
                              String code, String name, String desc, String prereq,
                              Double hours, User trainer, User createdBy,
                              LocalDate startDate, LocalDate endDate,
                              String category, Double passingScore) {
        return repo.save(Course.builder()
                .code(code).name(name).description(desc).prerequisites(prereq)
                .durationHours(hours).trainer(trainer).category(category)
                .level(com.itms.common.Level.BEGINNER)
                .status(endDate.isBefore(LocalDate.now())
                        ? com.itms.common.CourseStatus.INACTIVE
                        : com.itms.common.CourseStatus.ACTIVE)
                .passingScore(passingScore).maxAttempts(3)
                .startDate(startDate).endDate(endDate)
                .createdBy(createdBy).createdAt(LocalDateTime.now())
                .build());
    }

    private ClassRoom saveClass(ClassRoomRepository repo,
                                String classCode, String className,
                                Course course, User trainer,
                                Integer maxStudents, User createdBy) {
        return repo.save(ClassRoom.builder()
                .classCode(classCode).className(className)
                .course(course).trainer(trainer).maxStudents(maxStudents)
                .status("ACTIVE").createdBy(createdBy).createdAt(LocalDateTime.now())
                .build());
    }

    private void addMember(ClassMemberRepository repo, ClassRoom cls, User student, User by) {
        ClassMember m = new ClassMember();
        m.setClassRoom(cls); m.setUser(student);
        m.setStatus("ACTIVE"); m.setJoinedAt(LocalDateTime.now()); m.setAddedBy(by);
        repo.save(m);
    }

    private void saveSchedule(CourseScheduleRepository repo,
                              Course course, ClassRoom cls, User trainer,
                              String day, LocalTime start, LocalTime end,
                              String location, User createdBy) {
        CourseSchedule s = new CourseSchedule();
        s.setCourse(course); s.setClassRoom(cls); s.setTrainer(trainer);
        s.setDayOfWeek(day); s.setTimeStart(start); s.setTimeEnd(end);
        s.setLocation(location); s.setLocationType(LocationType.OFFLINE);
        s.setCreatedAt(LocalDateTime.now()); s.setCreatedBy(createdBy);
        repo.save(s);
    }

    private Session saveSession(SessionRepository repo,
                                Course course, ClassRoom cls, User trainer,
                                LocalDate date, LocalTime start, LocalTime end,
                                String location, User createdBy) {
        Session s = new Session();
        s.setCourse(course); s.setClassRoom(cls); s.setTrainer(trainer);
        s.setDate(date); s.setTimeStart(start); s.setTimeEnd(end);
        s.setLocation(location); s.setLocationType(LocationType.OFFLINE);
        s.setStatus(SessionStatus.COMPLETED);
        s.setMaxCapacity(cls.getMaxStudents() != null ? cls.getMaxStudents() : 30);
        s.setCurrentEnrolled(0); s.setCreatedAt(LocalDateTime.now()); s.setCreatedBy(createdBy);
        return repo.save(s);
    }

    /**
     * Create Enrollment + Attendance for each session for a student.
     * attended[i] = true/false for session i.
     */
    private void seedAttendance(EnrollmentRepository enrollRepo,
                                AttendanceRepository attRepo,
                                User student, List<Session> sessions,
                                boolean[] attended, User markedBy) {
        for (int i = 0; i < sessions.size(); i++) {
            Session session = sessions.get(i);
            boolean present = i < attended.length && attended[i];

            Enrollment enrollment = new Enrollment();
            enrollment.setUser(student);
            enrollment.setSession(session);
            enrollment.setStatus(com.itms.common.EnrollmentStatus.APPROVED);
            enrollment.setRegisteredAt(session.getDate().atStartOfDay());
            enrollment.setCreatedAt(session.getDate().atStartOfDay());
            enrollment = enrollRepo.save(enrollment);

            Attendance att = Attendance.builder()
                    .enrollment(enrollment)
                    .attended(present)
                    .completionStatus(present ? "COMPLETED" : "ABSENT")
                    .markedBy(markedBy)
                    .createdAt(session.getDate().atTime(session.getTimeEnd()))
                    .build();
            if (present) {
                att.setCheckInTime(session.getDate().atTime(session.getTimeStart()));
                att.setCheckOutTime(session.getDate().atTime(session.getTimeEnd()));
            }
            attRepo.save(att);
        }
    }
}
