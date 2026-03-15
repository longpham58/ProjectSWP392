package com.itms.config;

import com.itms.common.LocationType;
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
            if (RESET_DATA) {
                System.out.println("⏭️ Data reset disabled. Skipping...");
                return;
            }

            // Reset data if enabled
            if (RESET_DATA) {
                System.out.println("🔄 Resetting all data...");
                
                // Delete in correct order to avoid foreign key constraint violations
                // 1. Delete entities that depend on multiple other entities
                attendanceRepository.deleteAll();
                feedbackRepository.deleteAll();
                quizAttemptRepository.deleteAll();
                certificateRepository.deleteAll();
                
                // 2. Delete entities that depend on User and Course/Session
                enrollmentRepository.deleteAll();
                sessionRepository.deleteAll();
                
                // 3. Delete entities that depend on User
                notificationRepository.deleteAll();
                userModuleProgressRepository.deleteAll();
                classMemberRepository.deleteAll();
                materialRepository.deleteAll();
                
                // 4. Delete entities that depend on Course
                quizRepository.deleteAll();
                courseScheduleRepository.deleteAll();
                courseModuleRepository.deleteAll();
                
                // 5. Delete Course and ClassRoom
                courseRepository.deleteAll();
                classRoomRepository.deleteAll();
                
                // 6. Delete User-related entities
                userRoleRepository.deleteAll();
                userRepository.deleteAll();
                
                // 7. Delete base entities
                departmentRepository.deleteAll();
                roleRepository.deleteAll();
                
                System.out.println("✅ All data reset complete");
            }

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
            assignRole(userRoleRepository, emp3, employeeRole, admin);
            assignRole(userRoleRepository, emp4, employeeRole, admin);
            assignRole(userRoleRepository, emp5, employeeRole, admin);

            // =========================
            // Seed Courses
            // =========================
            Course javaCourse = createCourse(courseRepository,
                    "JAVA001", "Java Programming Fundamentals", 
                    "Learn Java programming from basics to advanced concepts",
                    "Basic programming knowledge", 40.0, trainer, admin);

            Course springCourse = createCourse(courseRepository,
                    "SPRING001", "Spring Boot Development",
                    "Master Spring Boot framework for enterprise applications",
                    "Java programming experience", 60.0, trainer2, admin);

            Course reactCourse = createCourse(courseRepository,
                    "REACT001", "React Frontend Development",
                    "Build modern web applications with React",
                    "JavaScript knowledge", 45.0, trainer3, admin);

            Course sqlCourse = createCourse(courseRepository,
                    "SQL001", "Database Management with SQL",
                    "Learn SQL for database operations and management",
                    "Basic computer skills", 30.0, trainer4, admin);

            Course pythonCourse = createCourse(courseRepository,
                    "PYTHON001", "Python Programming",
                    "Introduction to Python programming language",
                    "No prior programming experience required", 35.0, trainer5, admin);

            // =========================
            // Seed ClassRooms
            // =========================
            ClassRoom javaClass1 = createClassRoom(classRoomRepository,
                    "JAVA001-2024-01", "Java Class Spring 2024", javaCourse, trainer, 25, admin);

            ClassRoom javaClass2 = createClassRoom(classRoomRepository,
                    "JAVA001-2024-02", "Java Class Summer 2024", javaCourse, trainer, 30, admin);

            ClassRoom springClass1 = createClassRoom(classRoomRepository,
                    "SPRING001-2024-01", "Spring Boot Class 2024", springCourse, trainer2, 20, admin);

            ClassRoom reactClass1 = createClassRoom(classRoomRepository,
                    "REACT001-2024-01", "React Development Class", reactCourse, trainer3, 25, admin);

            ClassRoom sqlClass1 = createClassRoom(classRoomRepository,
                    "SQL001-2024-01", "SQL Database Class", sqlCourse, trainer4, 30, admin);

            ClassRoom pythonClass1 = createClassRoom(classRoomRepository,
                    "PYTHON001-2024-01", "Python Programming Class", pythonCourse, trainer5, 25, admin);

            // =========================
            // Seed ClassMembers (Students in Classes)
            // =========================
            // Add students to Java classes
            createClassMember(classMemberRepository, javaClass1, emp1, admin);
            createClassMember(classMemberRepository, javaClass1, emp2, admin);
            createClassMember(classMemberRepository, javaClass1, emp3, admin);
            
            createClassMember(classMemberRepository, javaClass2, emp4, admin);
            createClassMember(classMemberRepository, javaClass2, emp5, admin);
            
            // Add students to Spring Boot class
            createClassMember(classMemberRepository, springClass1, emp1, admin);
            createClassMember(classMemberRepository, springClass1, emp3, admin);
            createClassMember(classMemberRepository, springClass1, emp5, admin);
            
            // Add students to React class
            createClassMember(classMemberRepository, reactClass1, emp2, admin);
            createClassMember(classMemberRepository, reactClass1, emp4, admin);
            
            // Add students to SQL class
            createClassMember(classMemberRepository, sqlClass1, emp1, admin);
            createClassMember(classMemberRepository, sqlClass1, emp2, admin);
            createClassMember(classMemberRepository, sqlClass1, emp3, admin);
            createClassMember(classMemberRepository, sqlClass1, emp4, admin);
            
            // Add students to Python class
            createClassMember(classMemberRepository, pythonClass1, emp3, admin);
            createClassMember(classMemberRepository, pythonClass1, emp5, admin);

            // =========================
            // Seed CourseSchedules (recurring weekly schedule per class)
            // =========================
            createCourseSchedule(courseScheduleRepository, javaCourse, javaClass1, trainer,
                    "MON", LocalTime.of(8, 0), LocalTime.of(10, 0), "Phòng 101", admin);
            createCourseSchedule(courseScheduleRepository, javaCourse, javaClass1, trainer,
                    "WED", LocalTime.of(8, 0), LocalTime.of(10, 0), "Phòng 101", admin);

            createCourseSchedule(courseScheduleRepository, javaCourse, javaClass2, trainer,
                    "TUE", LocalTime.of(13, 0), LocalTime.of(15, 0), "Phòng 102", admin);
            createCourseSchedule(courseScheduleRepository, javaCourse, javaClass2, trainer,
                    "THU", LocalTime.of(13, 0), LocalTime.of(15, 0), "Phòng 102", admin);

            createCourseSchedule(courseScheduleRepository, springCourse, springClass1, trainer2,
                    "TUE", LocalTime.of(8, 0), LocalTime.of(10, 0), "Phòng 201", admin);
            createCourseSchedule(courseScheduleRepository, springCourse, springClass1, trainer2,
                    "FRI", LocalTime.of(8, 0), LocalTime.of(10, 0), "Phòng 201", admin);

            createCourseSchedule(courseScheduleRepository, reactCourse, reactClass1, trainer3,
                    "WED", LocalTime.of(13, 0), LocalTime.of(15, 0), "Phòng 301", admin);
            createCourseSchedule(courseScheduleRepository, reactCourse, reactClass1, trainer3,
                    "SAT", LocalTime.of(8, 0), LocalTime.of(10, 0), "Phòng 301", admin);

            createCourseSchedule(courseScheduleRepository, sqlCourse, sqlClass1, trainer4,
                    "MON", LocalTime.of(13, 0), LocalTime.of(15, 0), "Phòng 401", admin);
            createCourseSchedule(courseScheduleRepository, sqlCourse, sqlClass1, trainer4,
                    "THU", LocalTime.of(8, 0), LocalTime.of(10, 0), "Phòng 401", admin);

            createCourseSchedule(courseScheduleRepository, pythonCourse, pythonClass1, trainer5,
                    "WED", LocalTime.of(8, 0), LocalTime.of(10, 0), "Phòng 501", admin);
            createCourseSchedule(courseScheduleRepository, pythonCourse, pythonClass1, trainer5,
                    "FRI", LocalTime.of(13, 0), LocalTime.of(15, 0), "Phòng 501", admin);

            System.out.println("✅ ITMS seed data completed successfully");
            System.out.println("📊 Total courses: " + courseRepository.count());
            System.out.println("🏫 Total classrooms: " + classRoomRepository.count());
            System.out.println("📆 Total schedules: " + courseScheduleRepository.count());
            System.out.println("📅 Total sessions: " + sessionRepository.count());
            System.out.println("📝 Total enrollments: " + enrollmentRepository.count());

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
            String prerequisites,
            Double durationHours,
            User trainer,
            User createdBy
    ) {
        return repo.findByCode(code).orElseGet(() ->
                repo.save(Course.builder()
                        .code(code)
                        .name(name)
                        .description(description)
                        .prerequisites(prerequisites)
                        .durationHours(durationHours)
                        .trainer(trainer)
                        .category("Programming")
                        .level(com.itms.common.Level.BEGINNER)
                        .status(com.itms.common.CourseStatus.ACTIVE)
                        .passingScore(70.0)
                        .maxAttempts(3)
                        .startDate(java.time.LocalDate.now())
                        .endDate(java.time.LocalDate.now().plusMonths(3))
                        .createdBy(createdBy)
                        .createdAt(LocalDateTime.now())
                        .build())
        );
    }

    private ClassRoom createClassRoom(
            ClassRoomRepository repo,
            String classCode,
            String className,
            Course course,
            User trainer,
            Integer maxStudents,
            User createdBy
    ) {
        return repo.findByClassCode(classCode).orElseGet(() ->
                repo.save(ClassRoom.builder()
                        .classCode(classCode)
                        .className(className)
                        .course(course)
                        .trainer(trainer)
                        .maxStudents(maxStudents)
                        .status("ACTIVE")
                        .notes("Auto-generated class for " + course.getName())
                        .createdBy(createdBy)
                        .createdAt(LocalDateTime.now())
                        .build())
        );
    }

    private void createClassMember(
            ClassMemberRepository repo,
            ClassRoom classRoom,
            User student,
            User addedBy
    ) {
        if (!repo.existsByClassRoomIdAndUserId(classRoom.getId(), student.getId())) {
            ClassMember classMember = new ClassMember();
            classMember.setClassRoom(classRoom);
            classMember.setUser(student);
            classMember.setJoinedAt(LocalDateTime.now());
            classMember.setStatus("ACTIVE");
            classMember.setNotes("Auto-enrolled student");
            classMember.setAddedBy(addedBy);
            
            repo.save(classMember);
        }
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
            User createdBy
    ) {
        // Avoid duplicates
        boolean exists = repo.findByClassRoomId(classRoom.getId()).stream()
                .anyMatch(cs -> cs.getDayOfWeek().equalsIgnoreCase(dayOfWeek)
                        && cs.getTimeStart().equals(timeStart));
        if (exists) return;

        CourseSchedule schedule = new CourseSchedule();
        schedule.setCourse(course);
        schedule.setClassRoom(classRoom);
        schedule.setTrainer(trainer);
        schedule.setDayOfWeek(dayOfWeek);
        schedule.setTimeStart(timeStart);
        schedule.setTimeEnd(timeEnd);
        schedule.setLocation(location);
        schedule.setLocationType(LocationType.OFFLINE);
        schedule.setCreatedAt(LocalDateTime.now());
        schedule.setCreatedBy(createdBy);
        repo.save(schedule);
    }

}
