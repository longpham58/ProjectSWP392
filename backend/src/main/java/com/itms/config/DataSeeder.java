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

    @Bean
    CommandLineRunner seedData(
            DepartmentRepository departmentRepository,
            UserRepository userRepository,
            RoleRepository roleRepository,
            UserRoleRepository userRoleRepository,
            CourseRepository courseRepository,
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

            // =========================
            // Assign Roles (UserRole)
            // =========================
            assignRole(userRoleRepository, admin, adminRole, admin);
            assignRole(userRoleRepository, hrUser, hrRole, admin);
            assignRole(userRoleRepository, trainer, trainerRole, admin);
            assignRole(userRoleRepository, trainer, employeeRole, admin); // same as SQL
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
                CourseStatus.ACTIVE,
                admin
            );

            Course databaseCourse = createCourse(courseRepository,
                "ITM5004-M04",
                "Database Design & SQL",
                "Learn database design principles, SQL queries, and optimization techniques for relational databases.",
                "Design normalized databases\nWrite complex SQL queries\nOptimize database performance",
                "Basic computer knowledge",
                35.0,
                trainer,
                "Database",
                Level.BEGINNER,
                65.0,
                3,
                CourseStatus.ACTIVE,
                admin
            );

            Course devopsCourse = createCourse(courseRepository,
                "ITM5005-M05",
                "DevOps & CI/CD",
                "Master DevOps practices including Docker, Kubernetes, Jenkins, and automated deployment pipelines.",
                "Containerize applications with Docker\nOrchestrate with Kubernetes\nImplement CI/CD pipelines",
                "Linux basics\nBasic programming knowledge",
                45.0,
                trainer,
                "DevOps",
                Level.ADVANCED,
                80.0,
                2,
                CourseStatus.ACTIVE,
                admin
            );

            // =========================
            // Seed Sessions
            // =========================
            System.out.println("📅 Seeding sessions...");
            
            seedSessions(sessionRepository, javaCourse, trainer);
            seedSessions(sessionRepository, springCourse, trainer);
            seedSessions(sessionRepository, reactCourse, trainer);
            seedSessions(sessionRepository, databaseCourse, trainer);
            seedSessions(sessionRepository, devopsCourse, trainer);

            // =========================
            // Seed Enrollments
            // =========================
            System.out.println("📝 Seeding enrollments...");
            
            seedEnrollments(enrollmentRepository, sessionRepository, emp1, emp2);

            System.out.println("✅ ITMS seed data completed successfully");
            System.out.println("📊 Total courses in database: " + courseRepository.count());
            System.out.println("📅 Total sessions in database: " + sessionRepository.count());
            System.out.println("📝 Total enrollments in database: " + enrollmentRepository.count());
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
                    course.setStatus(status);
                    course.setCreatedAt(LocalDateTime.now());
                    course.setCreatedBy(createdBy);
                    
                    Course saved = repo.save(course);
                    System.out.println("✅ Created course: " + code + " - " + name);
                    return saved;
                });
    }

    /**
     * Seed sessions for a course
     */
    private void seedSessions(SessionRepository sessionRepository, Course course, User trainer) {
        // Check if sessions already exist for this course
        if (!sessionRepository.findByCourseIdOrderByDateAsc(course.getId()).isEmpty()) {
            System.out.println("⏭️ Sessions already exist for course: " + course.getCode());
            return;
        }

        System.out.println("📅 Creating sessions for course: " + course.getCode());
        
        // Get current date for scheduling
        LocalDate startDate = LocalDate.now().plusDays(7); // Start next week
        
        // Create sessions based on course type
        switch (course.getCode()) {
            case "ITM5001-M01": // Java Programming - 3 sessions per week
                createSessionsForJava(sessionRepository, course, trainer, startDate);
                break;
            case "ITM5002-M02": // Spring Boot - 2 sessions per week
                createSessionsForSpringBoot(sessionRepository, course, trainer, startDate);
                break;
            case "ITM5003-M03": // React - 2 sessions per week
                createSessionsForReact(sessionRepository, course, trainer, startDate);
                break;
            case "ITM5004-M04": // Database - 2 sessions per week
                createSessionsForDatabase(sessionRepository, course, trainer, startDate);
                break;
            case "ITM5005-M05": // DevOps - 1 session per week (intensive)
                createSessionsForDevOps(sessionRepository, course, trainer, startDate);
                break;
        }
    }

    private void createSessionsForJava(SessionRepository repo, Course course, User trainer, LocalDate startDate) {
        // Java: Every day at 07:00-08:00 (6 sessions across 2 weeks)
        for (int i = 0; i < 6; i++) {
            createSession(repo, course, 
                    startDate.plusDays(i), LocalTime.of(7, 0), LocalTime.of(8, 0), 
                    "Phòng 101", LocationType.OFFLINE, null, 30, trainer);
        }
    }

    private void createSessionsForSpringBoot(SessionRepository repo, Course course, User trainer, LocalDate startDate) {
        // Spring Boot: Every day at 08:00-09:00 (4 sessions across 2 weeks)
        for (int i = 0; i < 4; i++) {
            createSession(repo, course, 
                    startDate.plusDays(i), LocalTime.of(8, 0), LocalTime.of(9, 0), 
                    "Phòng 201", LocationType.OFFLINE, null, 25, trainer);
        }
    }

    private void createSessionsForReact(SessionRepository repo, Course course, User trainer, LocalDate startDate) {
        // React: Every day at 09:00-10:00 (4 sessions across 2 weeks)
        for (int i = 0; i < 4; i++) {
            createSession(repo, course, 
                    startDate.plusDays(i), LocalTime.of(9, 0), LocalTime.of(10, 0), 
                    "Online Meeting Room", LocationType.ONLINE, "https://zoom.us/j/123456789", 35, trainer);
        }
    }

    private void createSessionsForDatabase(SessionRepository repo, Course course, User trainer, LocalDate startDate) {
        // Database: Every day at 10:00-11:00 (4 sessions across 2 weeks)
        for (int i = 0; i < 4; i++) {
            createSession(repo, course, 
                    startDate.plusDays(i), LocalTime.of(10, 0), LocalTime.of(11, 0), 
                    "Phòng 301", LocationType.OFFLINE, null, 40, trainer);
        }
    }

    private void createSessionsForDevOps(SessionRepository repo, Course course, User trainer, LocalDate startDate) {
        // DevOps: Every day at 11:00-13:00 (3 sessions across 2 weeks)
        for (int i = 0; i < 3; i++) {
            createSession(repo, course, 
                    startDate.plusDays(i), LocalTime.of(11, 0), LocalTime.of(13, 0), 
                    "Lab 401", LocationType.OFFLINE, null, 20, trainer);
        }
    }

    private void createSession(SessionRepository repo, Course course,
                              LocalDate date, LocalTime startTime, LocalTime endTime, 
                              String location, LocationType locationType, String meetingLink, 
                              int maxCapacity, User createdBy) {
        Session session = new Session();
        session.setCourse(course);
        session.setDate(date);
        session.setTimeStart(startTime);
        session.setTimeEnd(endTime);
        session.setLocation(location);
        session.setLocationType(locationType);
        session.setMeetingLink(meetingLink);
        session.setMaxCapacity(maxCapacity);
        session.setCurrentEnrolled(0);
        session.setStatus(SessionStatus.SCHEDULED);
        session.setCreatedAt(LocalDateTime.now());
        session.setCreatedBy(createdBy);
        
        repo.save(session);
        System.out.println("✅ Created session on " + date + " at " + startTime);
    }

    /**
     * Seed enrollments for employees
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

        // Enroll emp1 in all sessions
        System.out.println("📝 Enrolling " + emp1.getFullName() + " in all sessions...");
        for (Session session : allSessions) {
            createEnrollmentWithAttendance(enrollmentRepository, emp1, session);
        }

        // Enroll emp2 in all sessions
        System.out.println("📝 Enrolling " + emp2.getFullName() + " in all sessions...");
        for (Session session : allSessions) {
            createEnrollmentWithAttendance(enrollmentRepository, emp2, session);
        }
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
