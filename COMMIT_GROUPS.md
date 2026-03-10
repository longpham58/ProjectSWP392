# Git Commit Groups for ITMS Project

Run these commands in your terminal to commit changes day by day.

---

## Commit 1: Quiz Result DTOs (already staged)
```bash
git commit -m "feat(quiz): Add quiz result DTOs

- QuestionResultDto: for individual question results
- QuizResultDto: for overall quiz attempt results
- QuizSubmitRequest: for submitting quiz answers"
```

---

## Commit 2: Quiz Module Backend
```bash
git add backend/src/main/java/com/itms/entity/Quiz.java
git add backend/src/main/java/com/itms/entity/QuizAttempt.java
git add backend/src/main/java/com/itms/dto/QuizDto.java
git add backend/src/main/java/com/itms/dto/QuizAttemptDto.java
git add backend/src/main/java/com/itms/repository/QuizRepository.java
git add backend/src/main/java/com/itms/repository/QuizAttemptRepository.java
git add backend/src/main/java/com/itms/controller/QuizController.java
git add backend/src/main/java/com/itms/service/QuizService.java
git commit -m "feat(quiz): Add quiz and quiz attempt entities with repository and service"
```

---

## Commit 3: Course Module System
```bash
git add backend/src/main/java/com/itms/entity/CourseModule.java
git add backend/src/main/java/com/itms/entity/Material.java
git add backend/src/main/java/com/itms/repository/CourseModuleRepository.java
git add backend/src/main/java/com/itms/dto/CourseModuleDto.java
git add backend/src/main/java/com/itms/service/CourseModuleService.java
git add backend/src/main/java/com/itms/controller/CourseController.java
git add backend/src/main/java/com/itms/service/CourseService.java
git add backend/src/main/java/com/itms/entity/Course.java
git commit -m "feat(course): Add course module system with materials support"
```

---

## Commit 4: Module Progress Tracking
```bash
git add backend/src/main/java/com/itms/entity/UserModuleProgress.java
git add backend/src/main/java/com/itms/repository/UserModuleProgressRepository.java
git add backend/src/main/java/com/itms/dto/ModuleProgressDto.java
git add backend/src/main/java/com/itms/controller/ModuleProgressController.java
git add backend/src/main/java/com/itms/service/ModuleProgressService.java
git commit -m "feat(progress): Add module progress tracking for employees"
```

---

## Commit 5: Attendance System
```bash
git add backend/src/main/java/com/itms/entity/Attendance.java
git add backend/src/main/java/com/itms/repository/AttendanceRepository.java
git add backend/src/main/java/com/itms/repository/SessionRepository.java
git add backend/src/main/java/com/itms/dto/SessionAttendanceDto.java
git add backend/src/main/java/com/itms/controller/AttendanceController.java
git add backend/src/main/java/com/itms/service/AttendanceService.java
git add backend/src/main/java/com/itms/repository/EnrollmentRepository.java
git commit -m "feat(attendance): Add attendance tracking for course sessions"
```

---

## Commit 6: Notification System
```bash
git add backend/src/main/java/com/itms/entity/Notification.java
git add backend/src/main/java/com/itms/repository/NotificationRepository.java
git add backend/src/main/java/com/itms/dto/NotificationDto.java
git add backend/src/main/java/com/itms/controller/NotificationController.java
git add backend/src/main/java/com/itms/service/NotificationService.java
git add backend/src/main/java/com/itms/common/NotificationPriority.java
git add backend/src/main/java/com/itms/common/ReferenceType.java
git add backend/src/main/java/com/itms/common/NotificationType.java
git add backend/src/main/java/com/itms/exception/GlobalExceptionHandler.java
git commit -m "feat(notification): Add notification system for employees"
```

---

## Commit 7: Frontend - Course & Module Pages
```bash
git add frontend/src/api/courses.api.ts
git add frontend/src/api/moduleProgress.api.ts
git add frontend/src/stores/course.store.ts
git add frontend/src/stores/moduleProgress.store.ts
git add frontend/src/pages/employee/CourseDetailPage.tsx
git add frontend/src/pages/employee/MyCoursesPage.tsx
git add frontend/src/pages/employee/EmployeePage.tsx
git commit -m "feat(frontend): Add course and module pages with API integration"
```

---

## Commit 8: Frontend - Quiz Module
```bash
git add frontend/src/api/quiz.api.ts
git add frontend/src/stores/quiz.store.ts
git add frontend/src/mocks/quiz.mock.ts
git add frontend/src/types/quiz.types.ts
git commit -m "feat(frontend): Add quiz module with API and store"
```

---

## Commit 9: Frontend - Attendance
```bash
git add frontend/src/api/attendance.api.ts
git add frontend/src/stores/attendance.store.ts
git add frontend/src/mocks/attendance.mock.ts
git commit -m "feat(frontend): Add attendance tracking UI components"
```

---

## Commit 10: Database Scripts
```bash
git add script.sql
git add script_module_progress.sql
git commit -m "chore(db): Add database scripts for new entities"
```

---

## Commit 11: Dashboard Updates
```bash
git add backend/src/main/java/com/itms/service/EmployeeDashboardService.java
git add backend/src/main/java/com/itms/dto/DeadlineDto.java
git add frontend/src/api/dashboard.api.ts
git add frontend/src/api/streak.api.ts
git add frontend/src/stores/streak.store.ts
git commit -m "feat(dashboard): Update employee dashboard with deadlines and streaks"
```
