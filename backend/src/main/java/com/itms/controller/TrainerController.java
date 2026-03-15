package com.itms.controller;

import com.itms.dto.*;
import com.itms.dto.common.ResponseDto;
import com.itms.entity.Course;
import com.itms.security.CustomUserDetails;
import com.itms.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/trainer")
@RequiredArgsConstructor
public class TrainerController {

    private final TrainerScheduleService trainerScheduleService;
    private final CourseService courseService;
    private final AttendanceService attendanceService;
    private final FeedbackService feedbackService;
    private final NotificationService notificationService;
    private final ClassRoomService classRoomService;
    private final TrainerAttendanceService trainerAttendanceService;

    /**
     * Get trainer's schedule
     */
    @GetMapping("/schedule")
    public ResponseEntity<ResponseDto<List<TrainerScheduleDto>>> getSchedule(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        Integer trainerId = userDetails.getId();
        List<TrainerScheduleDto> schedule = trainerScheduleService.getTrainerSchedule(trainerId);
        
        return ResponseEntity.ok(ResponseDto.success(schedule, "Lấy lịch giảng dạy thành công"));
    }

    /**
     * Get trainer's courses
     */
    @GetMapping("/courses")
    public ResponseEntity<ResponseDto<List<Course>>> getCourses(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        Integer trainerId = userDetails.getId();
        List<Course> courses = courseService.getCoursesByTrainerId(trainerId);
        
        return ResponseEntity.ok(ResponseDto.success(courses, "Lấy danh sách khóa học thành công"));
    }

    /**
     * Get trainer's courses in simple format for notifications
     */
    @GetMapping("/courses/simple")
    public ResponseEntity<ResponseDto<List<SimpleCourseDto>>> getCoursesSimple(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        Integer trainerId = userDetails.getId();
        List<SimpleCourseDto> simpleCourses = classRoomService.getClassesByTrainerId(trainerId);
        
        return ResponseEntity.ok(ResponseDto.success(simpleCourses, "Lấy danh sách lớp học thành công"));
    }

    /**
     * Get attendance for a specific session (old endpoint - kept for compatibility)
     */
    @GetMapping("/attendance/session/{sessionId}")
    public ResponseEntity<ResponseDto<List<SessionAttendanceDto>>> getSessionAttendance(
            @PathVariable Long sessionId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        List<SessionAttendanceDto> attendance = attendanceService.getSessionAttendance(sessionId);
        
        return ResponseEntity.ok(ResponseDto.success(attendance, "Lấy danh sách điểm danh thành công"));
    }

    /**
     * Get classes that have schedule today (for attendance)
     */
    @GetMapping("/attendance/today-classes")
    public ResponseEntity<ResponseDto<List<ClassAttendanceDto>>> getTodayClasses(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<ClassAttendanceDto> classes = trainerAttendanceService.getTodayClasses(userDetails.getId());
        return ResponseEntity.ok(ResponseDto.success(classes, "Lấy danh sách lớp hôm nay thành công"));
    }

    /**
     * Get attendance for a class on a specific date
     */
    @GetMapping("/attendance/class/{classCode}")
    public ResponseEntity<ResponseDto<ClassAttendanceDto>> getClassAttendance(
            @PathVariable String classCode,
            @RequestParam(required = false) String date,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        LocalDate attendanceDate = (date != null && !date.isEmpty())
                ? LocalDate.parse(date)
                : LocalDate.now();

        ClassAttendanceDto result = trainerAttendanceService.getClassAttendance(classCode, attendanceDate);
        return ResponseEntity.ok(ResponseDto.success(result, "Lấy danh sách điểm danh thành công"));
    }

    /**
     * Save attendance for a class on a specific date
     */
    @PostMapping("/attendance/class/{classCode}")
    public ResponseEntity<ResponseDto<String>> saveClassAttendance(
            @PathVariable String classCode,
            @RequestParam(required = false) String date,
            @RequestBody SaveAttendanceRequest body,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        LocalDate attendanceDate = (date != null && !date.isEmpty())
                ? LocalDate.parse(date)
                : LocalDate.now();

        trainerAttendanceService.saveClassAttendance(classCode, attendanceDate, body.getStudents(), userDetails.getId());
        return ResponseEntity.ok(ResponseDto.success("", "Lưu điểm danh thành công"));
    }

    /**
     * Update attendance for students in a session (old endpoint)
     */
    @PostMapping("/attendance/session/{sessionId}")
    public ResponseEntity<ResponseDto<String>> updateAttendance(
            @PathVariable Long sessionId,
            @RequestBody List<AttendanceUpdateRequest> attendanceUpdates,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        attendanceService.updateAttendance(sessionId, attendanceUpdates);
        
        return ResponseEntity.ok(ResponseDto.success("", "Cập nhật điểm danh thành công"));
    }

    /**
     * Get feedback for trainer's courses
     */
    @GetMapping("/feedback")
    public ResponseEntity<ResponseDto<List<FeedbackDto>>> getFeedback(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        Integer trainerId = userDetails.getId();
        List<FeedbackDto> feedback = feedbackService.getFeedbackForTrainer(trainerId);
        
        return ResponseEntity.ok(ResponseDto.success(feedback, "Lấy danh sách feedback thành công"));
    }

    /**
     * Reply to feedback
     */
    @PostMapping("/feedback/{feedbackId}/reply")
    public ResponseEntity<ResponseDto<String>> replyToFeedback(
            @PathVariable Long feedbackId,
            @RequestBody FeedbackReplyRequest replyRequest,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        feedbackService.replyToFeedback(feedbackId, replyRequest.getReply());
        
        return ResponseEntity.ok(ResponseDto.success("", "Phản hồi feedback thành công"));
    }

    /**
     * Get trainer's notifications
     */
    @GetMapping("/notifications")
    public ResponseEntity<ResponseDto<List<NotificationDto>>> getNotifications(
            @RequestParam(defaultValue = "inbox") String category,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        Integer trainerId = userDetails.getId();
        List<NotificationDto> notifications = notificationService.getNotificationsByCategory(trainerId, category);
        
        return ResponseEntity.ok(ResponseDto.success(notifications, "Lấy danh sách thông báo thành công"));
    }

    /**
     * Create notification
     */
    @PostMapping("/notifications")
    public ResponseEntity<ResponseDto<String>> createNotification(
            @RequestBody CreateNotificationRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        if (userDetails == null) {
            return ResponseEntity.status(401)
                    .body(ResponseDto.fail("User not authenticated"));
        }
        
        Integer trainerId = userDetails.getId();
        if (trainerId == null) {
            return ResponseEntity.status(400)
                    .body(ResponseDto.fail("Trainer ID is null"));
        }
        
        try {
            notificationService.createNotification(trainerId, request);
            return ResponseEntity.ok(ResponseDto.success("", "Tạo thông báo thành công"));
        } catch (Exception e) {
            System.err.println("Error creating notification: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(ResponseDto.fail("Lỗi khi tạo thông báo: " + e.getMessage()));
        }
    }

    /**
     * Mark notification as read
     */
    @PutMapping("/notifications/{notificationId}/read")
    public ResponseEntity<ResponseDto<String>> markNotificationAsRead(
            @PathVariable Integer notificationId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        notificationService.markAsRead(notificationId);
        
        return ResponseEntity.ok(ResponseDto.success("", "Đánh dấu đã đọc thành công"));
    }

    /**
     * Delete notification
     */
    @DeleteMapping("/notifications/{notificationId}")
    public ResponseEntity<ResponseDto<String>> deleteNotification(
            @PathVariable Integer notificationId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        notificationService.deleteNotification(notificationId);
        
        return ResponseEntity.ok(ResponseDto.success("", "Xóa thông báo thành công"));
    }

    /**
     * Update notification (for drafts)
     */
    @PutMapping("/notifications/{notificationId}")
    public ResponseEntity<ResponseDto<String>> updateNotification(
            @PathVariable Integer notificationId,
            @RequestBody CreateNotificationRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        Integer trainerId = userDetails.getId();
        notificationService.updateNotification(notificationId, trainerId, request);
        
        return ResponseEntity.ok(ResponseDto.success("", "Cập nhật thông báo thành công"));
    }

    /**
     * Send a draft notification
     */
    @PostMapping("/notifications/{notificationId}/send")
    public ResponseEntity<ResponseDto<String>> sendNotification(
            @PathVariable Integer notificationId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        notificationService.sendNotification(notificationId);
        
        return ResponseEntity.ok(ResponseDto.success("", "Gửi thông báo thành công"));
    }

    // DTOs for requests
    public static class AttendanceUpdateRequest {
        private Integer studentId;
        private Boolean attended;
        private String notes;
        
        // Getters and setters
        public Integer getStudentId() { return studentId; }
        public void setStudentId(Integer studentId) { this.studentId = studentId; }
        public Boolean getAttended() { return attended; }
        public void setAttended(Boolean attended) { this.attended = attended; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public static class FeedbackReplyRequest {
        private String reply;
        
        public String getReply() { return reply; }
        public void setReply(String reply) { this.reply = reply; }
    }

    public static class CreateNotificationRequest {
        private String title;
        private String message;
        private String type;
        private String priority;
        private String recipientType;
        private List<String> classCodes;
        private Boolean isDraft;
        
        // Getters and setters
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
        public String getRecipientType() { return recipientType; }
        public void setRecipientType(String recipientType) { this.recipientType = recipientType; }
        public List<String> getClassCodes() { return classCodes; }
        public void setClassCodes(List<String> classCodes) { this.classCodes = classCodes; }
        public Boolean getIsDraft() { return isDraft; }
        public void setIsDraft(Boolean isDraft) { this.isDraft = isDraft; }
    }

    public static class SaveAttendanceRequest {
        private List<StudentAttendanceItem> students;
        public List<StudentAttendanceItem> getStudents() { return students; }
        public void setStudents(List<StudentAttendanceItem> s) { this.students = s; }
    }

    public static class StudentAttendanceItem {
        private Integer userId;
        private String fullName;
        private String email;
        private Boolean attended;
        private String notes;
        public Integer getUserId() { return userId; }
        public void setUserId(Integer userId) { this.userId = userId; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public Boolean getAttended() { return attended; }
        public void setAttended(Boolean attended) { this.attended = attended; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public static class SimpleCourseDto {
        private String code;
        private String name;
        
        public SimpleCourseDto(String code, String name) {
            this.code = code;
            this.name = name;
        }
        
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }
}