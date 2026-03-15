package com.itms.config;

import com.itms.common.CourseStatus;
import com.itms.common.EnrollmentStatus;
import com.itms.common.Level;
import com.itms.common.LocationType;
import com.itms.common.SessionStatus;
import com.itms.entity.*;
import com.itms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Component
@RequiredArgsConstructor
public class DataSeeder {

    private final PasswordEncoder passwordEncoder;

    // Set to true to reset and reseed data every time the app starts
    private static final boolean RESET_DATA = true;

    @Bean
    CommandLineRunner seedData(
            DepartmentRepository departmentRepository,
            UserRepository userRepository,
            RoleRepository roleRepository,
            UserRoleRepository userRoleRepository,
            CourseRepository courseRepository,
            ClassRoomRepository classRoomRepository,
            ClassMemberRepository classMemberRepository,
            CourseScheduleRepository courseScheduleRepository,
            SessionRepository sessionRepository,
            EnrollmentRepository enrollmentRepository
    ) {
        return new CommandLineRunner() {
            @Override
            @Transactional
            public void run(String... args) throws Exception {
            // =========================
            // Seed Roles
            // =========================
            Role adminRole = createRole(roleRepository,
                    "Administrator", "ADMIN", "Full system access");

            Role hrRole = createRole(roleRepository,
                    "Human Resources", "HR", "Manage training programs");

            Role trainerRole = createRole(roleRepository,
                    "Trainer", "TRAINER", "Conduct training sessions");

            Role employeeRole = createRole(roleRepository,
                    "Employee", "EMPLOYEE", "Access training courses");

            // =========================
            // Seed Departments
            // =========================
            Department it = createDepartment(departmentRepository,
                    "IT Department", "IT", "Information Technology Department");

            Department hr = createDepartment(departmentRepository,
                    "HR Department", "HR", "Human Resources Department");

            Department finance = createDepartment(departmentRepository,
                    "Finance Department", "FIN", "Finance and Accounting Department");

            Department sales = createDepartment(departmentRepository,
                    "Sales Department", "SALES", "Sales and Marketing Department");

            // =========================
            // Seed Users
            // =========================
            String password = passwordEncoder.encode("admin123");

            User admin = createUser(userRepository,
                    "admin", "admin@itms.com", "System Administrator",
                    "0905123456", it, password);

            User hrUser = createUser(userRepository,
                    "hr001", "hr@itms.com", "Nguyễn Văn HR",
                    "0905123457", hr, password);

            User trainer = createUser(userRepository,
                    "trainer001", "trainer@itms.com", "Trần Thị Trainer",
                    "0905123458", it, password);

            User emp1 = createUser(userRepository,
                    "emp001", "employee@itms.com", "Lê Văn Employee",
                    "0905123459", finance, password);

            User emp2 = createUser(userRepository,
                    "emp002", "employee2@itms.com", "Phạm Thị Mai",
                    "0905123460", sales, password);

            User emp3 = createUser(userRepository,
                    "emp003", "emp003@itms.com", "Nguyễn Văn A",
                    "0905123461", it, password);

            User emp4 = createUser(userRepository,
                    "emp004", "emp004@itms.com", "Trần Thị B",
                    "0905123462", hr, password);

            User emp5 = createUser(userRepository,
                    "emp005", "emp005@itms.com", "Lê Văn C",
                    "0905123463", finance, password);

            User trainer2 = createUser(userRepository,
                    "trainer002", "trainer002@itms.com", "Nguyễn Văn Trainer",
                    "0905123464", it, password);

            User trainer3 = createUser(userRepository,
                    "trainer003", "trainer003@itms.com", "Phạm Thị Trainer",
                    "0905123465", sales, password);

            User trainer4 = createUser(userRepository,
                    "trainer004", "trainer004@itms.com", "Lê Văn Trainer",
                    "0905123466", finance, password);

            User trainer5 = createUser(userRepository,
                    "trainer005", "trainer005@itms.com", "Trần Văn Trainer",
                    "0905123467", hr, password);

            // =========================
            // Assign Roles (UserRole)
            // =========================
            assignRole(userRoleRepository, admin, adminRole, admin);
            assignRole(userRoleRepository, hrUser, hrRole, admin);
            assignRole(userRoleRepository, trainer, trainerRole, admin);
            assignRole(userRoleRepository, trainer, employeeRole, admin);
            assignRole(userRoleRepository, trainer2, trainerRole, admin);
            assignRole(userRoleRepository, trainer3, trainerRole, admin);
            assignRole(userRoleRepository, trainer4, trainerRole, admin);
            assignRole(userRoleRepository, trainer5, trainerRole, admin);
            assignRole(userRoleRepository, emp1, employeeRole, admin);
            assignRole(userRoleRepository, emp2, employeeRole, admin);

            // =========================
            // Seed Courses (Always run)
            // =========================
            System.out.println("📚 Seeding courses...");
            
            Course javaCourse = createCourse(courseRepository, 
                "ITM5001-M01", 
                "Java Programming Fundamentals",
                "Learn the basics of Java programming including OOP concepts, data structures, and best practices.",
                "Understand Java syntax and core concepts\nMaster Object-Oriented Programming\nBuild real-world applications",
                "Basic computer knowledge\nLogical thinking skills",
                40.0,
                trainer,
                "Programming",
                Level.BEGINNER,
                70.0,
                3,
                LocalDate.now().plusDays(7),  // Start date
                LocalDate.now().plusDays(37), // End date (30 days later)
                CourseStatus.ACTIVE,
                admin
            );

            Course springCourse = createCourse(courseRepository,
                "ITM5002-M02",
                "Spring Boot Development",
                "Master Spring Boot framework for building enterprise-level Java applications with REST APIs and microservices.",
                "Build REST APIs with Spring Boot\nImplement security with Spring Security\nWork with databases using JPA",
                "Java Programming knowledge\nBasic understanding of web development",
                60.0,
                trainer,
                "Backend Development",
                Level.INTERMEDIATE,
                75.0,
                3,
                LocalDate.now().plusDays(7),
                LocalDate.now().plusDays(37),
                CourseStatus.ACTIVE,
                admin
            );

            Course reactCourse = createCourse(courseRepository,
                "ITM5003-M03",
                "React & Modern Frontend",
                "Build modern, responsive web applications using React, TypeScript, and modern frontend tools.",
                "Master React hooks and components\nImplement state management\nBuild responsive UIs with Tailwind CSS",
                "HTML, CSS, JavaScript basics\nES6+ knowledge",
                50.0,
                trainer,
                "Frontend Development",
                Level.INTERMEDIATE,
                70.0,
                3,
                LocalDate.now().plusDays(7),
                LocalDate.now().plusDays(37),
                CourseStatus.ACTIVE,
                admin
            );

            // =========================
            // Seed ClassRooms
            // =========================
            System.out.println("🏫 Seeding classrooms...");
            
            ClassRoom javaClass1 = createClassRoom(classRoomRepository, javaCourse, "SE18D01", "Java Class Morning", trainer, 30, admin);
            ClassRoom javaClass2 = createClassRoom(classRoomRepository, javaCourse, "SE18D02", "Java Class Evening", trainer, 30, admin);
            ClassRoom springClass = createClassRoom(classRoomRepository, springCourse, "SE18D10", "Spring Boot Class", trainer, 25, admin);
            ClassRoom reactClass = createClassRoom(classRoomRepository, reactCourse, "SE18D15", "React Class", trainer, 35, admin);

            // =========================
            // Add ClassMembers (Students)
            // =========================
            System.out.println("👥 Adding students to classes...");
            
            addClassMember(classMemberRepository, javaClass1, emp1, admin);
            addClassMember(classMemberRepository, javaClass1, emp2, admin);
            addClassMember(classMemberRepository, springClass, emp1, admin);
            addClassMember(classMemberRepository, reactClass, emp2, admin);

            // =========================
            // Seed CourseSchedules (Recurring patterns)
            // =========================
            System.out.println("📆 Seeding course schedules...");
            
            // Java Class 1: Mon, Wed, Fri at 07:00-09:00
            createCourseSchedule(courseScheduleRepository, javaCourse, javaClass1, trainer, "MON", 
                LocalTime.of(7, 0), LocalTime.of(9, 0), "Phòng 101", LocationType.OFFLINE, null, admin);
            createCourseSchedule(courseScheduleRepository, javaCourse, javaClass1, trainer, "WED", 
                LocalTime.of(7, 0), LocalTime.of(9, 0), "Phòng 101", LocationType.OFFLINE, null, admin);
            createCourseSchedule(courseScheduleRepository, javaCourse, javaClass1, trainer, "FRI", 
                LocalTime.of(7, 0), LocalTime.of(9, 0), "Phòng 101", LocationType.OFFLINE, null, admin);

            // Java Class 2: Tue, Thu at 17:00-19:00
            createCourseSchedule(courseScheduleRepository, javaCourse, javaClass2, trainer, "TUE", 
                LocalTime.of(17, 0), LocalTime.of(19, 0), "Phòng 102", LocationType.OFFLINE, null, admin);
            createCourseSchedule(courseScheduleRepository, javaCourse, javaClass2, trainer, "THU", 
                LocalTime.of(17, 0), LocalTime.of(19, 0), "Phòng 102", LocationType.OFFLINE, null, admin);

            // Spring Boot: Mon, Wed at 09:00-11:00
            createCourseSchedule(courseScheduleRepository, springCourse, springClass, trainer, "MON", 
                LocalTime.of(9, 0), LocalTime.of(11, 0), "Phòng 201", LocationType.OFFLINE, null, admin);
            createCourseSchedule(courseScheduleRepository, springCourse, springClass, trainer, "WED", 
                LocalTime.of(9, 0), LocalTime.of(11, 0), "Phòng 201", LocationType.OFFLINE, null, admin);

            // React: Tue, Thu at 13:00-15:00 (Online)
            createCourseSchedule(courseScheduleRepository, reactCourse, reactClass, trainer, "TUE", 
                LocalTime.of(13, 0), LocalTime.of(15, 0), "Online", LocationType.ONLINE, "https://zoom.us/j/123456789", admin);
            createCourseSchedule(courseScheduleRepository, reactCourse, reactClass, trainer, "THU", 
                LocalTime.of(13, 0), LocalTime.of(15, 0), "Online", LocationType.ONLINE, "https://zoom.us/j/123456789", admin);

            // =========================
            // Generate Sessions using SP logic
            // =========================
            System.out.println("📅 Generating sessions from schedules...");
            
            generateSessionsForClass(sessionRepository, courseScheduleRepository, javaClass1);
            generateSessionsForClass(sessionRepository, courseScheduleRepository, javaClass2);
            generateSessionsForClass(sessionRepository, courseScheduleRepository, springClass);
            generateSessionsForClass(sessionRepository, courseScheduleRepository, reactClass);

            // =========================
            // Seed Enrollments
            // =========================
            System.out.println("📝 Seeding enrollments...");
            
            seedEnrollments(enrollmentRepository, sessionRepository, emp1, emp2);

            System.out.println("✅ ITMS seed data completed successfully");
            System.out.println("📊 Total courses: " + courseRepository.count());
            System.out.println("🏫 Total classrooms: " + classRoomRepository.count());
            System.out.println("📆 Total schedules: " + courseScheduleRepository.count());
            System.out.println("📅 Total sessions: " + sessionRepository.count());
            System.out.println("📝 Total enrollments: " + enrollmentRepository.count());
            }
        };
    }

    // =========================
    // Helper methods
    // =========================

    private Role createRole(RoleRepository repo, String name, String code, String desc) {
        return repo.findByRoleCode(code).orElseGet(() ->
                repo.save(Role.builder()
                        .roleName(name)
                        .roleCode(code)
                        .description(desc)
                        .isActive(true)
                        .createdAt(LocalDateTime.now())
                        .build())
        );
    }

    private Department createDepartment(
            DepartmentRepository repo,
            String name,
            String code,
            String desc
    ) {
        return repo.findByName(name).orElseGet(() ->
                repo.save(Department.builder()
                        .name(name)
                        .code(code)
                        .description(desc)
                        .isActive(true)
                        .createdAt(LocalDateTime.now())
                        .build())
        );
    }

    private User createUser(
            UserRepository repo,
            String username,
            String email,
            String fullName,
            String phone,
            Department dept,
            String password
    ) {
        return repo.findByUsername(username).orElseGet(() ->
                repo.save(User.builder()
                        .username(username)
                        .email(email)
                        .fullName(fullName)
                        .phone(phone)
                        .department(dept)
                        .password(password)
                        .isActive(true)
                        .otpEnabled(false)
                        .createdAt(LocalDateTime.now())
                        .build())
        );
    }

    private void assignRole(
            UserRoleRepository repo,
            User user,
            Role role,
            User assignedBy
    ) {
        if (repo.existsByUserAndRole(user, role)) {
            return; // already assigned
        }

        UserRole userRole = UserRole.builder()
                .user(user)
                .role(role)
                .assignedBy(assignedBy)
                .isActive(true)
                .build();

        repo.save(userRole);
    }

    private Course createCourse(
            CourseRepository repo,
            String code,
            String name,
            String description,
            String objectives,
            String prerequisites,
            Double durationHours,
            User trainer,
            String category,
            Level level,
            Double passingScore,
            Integer maxAttempts,
            LocalDate startDate,
            LocalDate endDate,
            CourseStatus status,
            User createdBy
    ) {
        // Check if course already exists by code
        return repo.findAll().stream()
                .filter(c -> c.getCode().equals(code))
                .findFirst()
                .orElseGet(() -> {
                    Course course = new Course();
                    course.setCode(code);
                    course.setName(name);
                    course.setDescription(description);
                    course.setObjectives(objectives);
                    course.setPrerequisites(prerequisites);
                    course.setDurationHours(durationHours);
                    course.setTrainer(trainer);
                    course.setCategory(category);
                    course.setLevel(level);
                    course.setPassingScore(passingScore);
                    course.setMaxAttempts(maxAttempts);
                    course.setStartDate(startDate);
                    course.setEndDate(endDate);
                    course.setStatus(status);
                    course.setCreatedAt(LocalDateTime.now());
                    course.setCreatedBy(createdBy);
                    
                    Course saved = repo.save(course);
                    System.out.println("✅ Created course: " + code + " - " + name);
                    return saved;
                });
    }

    private ClassRoom createClassRoom(
            ClassRoomRepository repo,
            Course course,
            String classCode,
            String className,
            User trainer,
            Integer maxStudents,
            User createdBy
    ) {
        return repo.findAll().stream()
                .filter(c -> c.getClassCode().equals(classCode))
                .findFirst()
                .orElseGet(() -> {
                    ClassRoom classRoom = new ClassRoom();
                    classRoom.setCourse(course);
                    classRoom.setClassCode(classCode);
                    classRoom.setClassName(className);
                    classRoom.setTrainer(trainer);
                    classRoom.setMaxStudents(maxStudents);
                    classRoom.setStatus("ACTIVE");
                    classRoom.setCreatedAt(LocalDateTime.now());
                    classRoom.setCreatedBy(createdBy);
                    
                    ClassRoom saved = repo.save(classRoom);
                    System.out.println("✅ Created classroom: " + classCode + " - " + className);
                    return saved;
                });
    }

    private void addClassMember(
            ClassMemberRepository repo,
            ClassRoom classRoom,
            User student,
            User addedBy
    ) {
        boolean exists = repo.findAll().stream()
                .anyMatch(cm -> cm.getClassRoom().getId().equals(classRoom.getId()) 
                        && cm.getUser().getId().equals(student.getId()));
        
        if (exists) {
            System.out.println("⏭️ Student " + student.getFullName() + " already in class " + classRoom.getClassCode());
            return;
        }

        ClassMember member = new ClassMember();
        member.setClassRoom(classRoom);
        member.setUser(student);
        member.setJoinedAt(LocalDateTime.now());
        member.setStatus("ACTIVE");
        member.setAddedBy(addedBy);
        
        repo.save(member);
        System.out.println("✅ Added " + student.getFullName() + " to class " + classRoom.getClassCode());
    }

    private void createCourseSchedule(
            CourseScheduleRepository repo,
            Course course,
            ClassRoom classRoom,
            User trainer,
            String dayOfWeek,
            LocalTime timeStart,
            LocalTime timeEnd,
            String location,
            LocationType locationType,
            String meetingLink,
            User createdBy
    ) {
        boolean exists = repo.findAll().stream()
                .anyMatch(cs -> cs.getClassRoom().getId().equals(classRoom.getId()) 
                        && cs.getDayOfWeek().equals(dayOfWeek)
                        && cs.getTimeStart().equals(timeStart));
        
        if (exists) {
            System.out.println("⏭️ Schedule already exists for " + classRoom.getClassCode() + " on " + dayOfWeek);
            return;
        }

        CourseSchedule schedule = new CourseSchedule();
        schedule.setCourse(course);
        schedule.setClassRoom(classRoom);
        schedule.setTrainer(trainer);
        schedule.setDayOfWeek(dayOfWeek);
        schedule.setTimeStart(timeStart);
        schedule.setTimeEnd(timeEnd);
        schedule.setLocation(location);
        schedule.setLocationType(locationType);
        schedule.setMeetingLink(meetingLink);
        schedule.setCreatedAt(LocalDateTime.now());
        schedule.setCreatedBy(createdBy);
        
        repo.save(schedule);
        System.out.println("✅ Created schedule: " + classRoom.getClassCode() + " - " + dayOfWeek + " " + timeStart);
    }

    /**
     * Generate sessions for a class based on CourseSchedule (mimics SP_GenerateSessions)
     */
    private void generateSessionsForClass(
            SessionRepository sessionRepo,
            CourseScheduleRepository scheduleRepo,
            ClassRoom classRoom
    ) {
        Course course = classRoom.getCourse();
        LocalDate startDate = course.getStartDate();
        LocalDate endDate = course.getEndDate();
        
        if (startDate == null || endDate == null) {
            System.out.println("⚠️ Course " + course.getCode() + " has no start/end date, skipping session generation");
            return;
        }

        // Get all schedules for this class
        java.util.List<CourseSchedule> schedules = scheduleRepo.findAll().stream()
                .filter(cs -> cs.getClassRoom().getId().equals(classRoom.getId()))
                .toList();

        if (schedules.isEmpty()) {
            System.out.println("⚠️ No schedules found for class " + classRoom.getClassCode());
            return;
        }

        System.out.println("📅 Generating sessions for class: " + classRoom.getClassCode() + 
                " from " + startDate + " to " + endDate);

        int sessionCount = 0;
        LocalDate currentDate = startDate;

        while (!currentDate.isAfter(endDate)) {
            String dayOfWeek = getDayOfWeekCode(currentDate);
            final LocalDate finalCurrentDate = currentDate; // Make effectively final for lambda
            
            // Find schedules matching this day
            for (CourseSchedule schedule : schedules) {
                if (schedule.getDayOfWeek().equals(dayOfWeek)) {
                    final CourseSchedule finalSchedule = schedule; // Make effectively final for lambda
                    
                    // Check if session already exists
                    boolean exists = sessionRepo.findAll().stream()
                            .anyMatch(s -> s.getClassRoom().getId().equals(classRoom.getId())
                                    && s.getDate().equals(finalCurrentDate)
                                    && s.getTimeStart().equals(finalSchedule.getTimeStart()));
                    
                    if (!exists) {
                        Session session = new Session();
                        session.setCourse(course);
                        session.setClassRoom(classRoom);
                        session.setSchedule(finalSchedule);
                        session.setTrainer(finalSchedule.getTrainer()); // ⭐ Copy trainer from schedule
                        session.setDate(finalCurrentDate);
                        session.setTimeStart(finalSchedule.getTimeStart());
                        session.setTimeEnd(finalSchedule.getTimeEnd());
                        session.setLocation(finalSchedule.getLocation());
                        session.setLocationType(finalSchedule.getLocationType());
                        session.setMeetingLink(finalSchedule.getMeetingLink());
                        session.setMaxCapacity(classRoom.getMaxStudents());
                        session.setCurrentEnrolled(0);
                        session.setStatus(SessionStatus.SCHEDULED);
                        session.setCreatedAt(LocalDateTime.now());
                        
                        sessionRepo.save(session);
                        sessionCount++;
                    }
                }
            }
            
            currentDate = currentDate.plusDays(1);
        }

        System.out.println("✅ Generated " + sessionCount + " sessions for class " + classRoom.getClassCode());
    }

    /**
     * Convert LocalDate to day of week code (MON, TUE, etc.)
     */
    private String getDayOfWeekCode(LocalDate date) {
        return switch (date.getDayOfWeek()) {
            case MONDAY -> "MON";
            case TUESDAY -> "TUE";
            case WEDNESDAY -> "WED";
            case THURSDAY -> "THU";
            case FRIDAY -> "FRI";
            case SATURDAY -> "SAT";
            case SUNDAY -> "SUN";
        };
    }

    /**
     * Seed enrollments for employees
     * Only enroll students into sessions of classes they are members of
     */
    private void seedEnrollments(EnrollmentRepository enrollmentRepository, 
                                SessionRepository sessionRepository,
                                User emp1, User emp2) {
        // Get all sessions
        java.util.List<Session> allSessions = sessionRepository.findAll();
        
        if (allSessions.isEmpty()) {
            System.out.println("⏭️ No sessions found, skipping enrollments");
            return;
        }

        System.out.println("📝 Creating enrollments based on class membership...");
        
        // Enroll each student only in sessions of their classes
        for (Session session : allSessions) {
            ClassRoom classRoom = session.getClassRoom();
            
            // Check if emp1 is a member of this class
            boolean emp1IsMember = classRoom.getClassCode().equals("SE18D01") || 
                                   classRoom.getClassCode().equals("SE18D10");
            if (emp1IsMember) {
                createEnrollmentWithAttendance(enrollmentRepository, emp1, session);
            }
            
            // Check if emp2 is a member of this class
            boolean emp2IsMember = classRoom.getClassCode().equals("SE18D01") || 
                                   classRoom.getClassCode().equals("SE18D15");
            if (emp2IsMember) {
                createEnrollmentWithAttendance(enrollmentRepository, emp2, session);
            }
        }
        
        System.out.println("✅ Enrollments created successfully");
    }

    /**
     * Create a single enrollment with attendance record
     */
    private void createEnrollmentWithAttendance(EnrollmentRepository enrollmentRepo, User user, Session session) {
        // Check if enrollment already exists
        try {
            Enrollment existing = enrollmentRepo.findByUserIdAndSessionId(user.getId(), session.getId().intValue());
            if (existing != null) {
                System.out.println("⏭️ Enrollment already exists for " + user.getFullName() + " in session " + session.getId());
                return;
            }
        } catch (Exception e) {
            // Continue if query fails
        }

        Enrollment enrollment = new Enrollment();
        enrollment.setUser(user);
        enrollment.setSession(session);
        enrollment.setStatus(EnrollmentStatus.APPROVED);
        enrollment.setRegisteredAt(LocalDateTime.now());
        enrollment.setApprovalDate(LocalDateTime.now());
        enrollment.setCertificateIssued(false);
        enrollment.setCreatedAt(LocalDateTime.now());
        
        Enrollment savedEnrollment = enrollmentRepo.save(enrollment);
        System.out.println("✅ Enrolled " + user.getFullName() + " in session " + session.getId());
    }

}
