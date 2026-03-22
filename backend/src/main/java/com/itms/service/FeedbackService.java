package com.itms.service;

import com.itms.dto.FeedbackDto;
import com.itms.entity.Course;
import com.itms.entity.Feedback;
import com.itms.entity.FeedbackStatus;
import com.itms.entity.FeedbackType;
import com.itms.entity.User;
import com.itms.repository.FeedbackRepository;
import com.itms.repository.UserRepository;
import com.itms.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    /**
     * Get all feedback for a course (direct course_id link)
     */
    public List<FeedbackDto> getCourseFeedback(Integer courseId) {
        List<Feedback> feedbacks = feedbackRepository.findByCourseId(courseId);
        return feedbacks.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get user's feedback for a course
     */
    public FeedbackDto getUserFeedback(Integer userId, Integer courseId) {
        return feedbackRepository.findByUserIdAndCourseId(userId, courseId)
                .map(this::mapToDto)
                .orElse(null);
    }

    /**
     * Check if user has submitted feedback for a course
     */
    public boolean hasUserSubmittedFeedback(Integer userId, Integer courseId) {
        return feedbackRepository.findByUserIdAndCourseId(userId, courseId).isPresent();
    }

    /**
     * Submit feedback for a course (linked directly to course_id)
     */
    @Transactional
    public FeedbackDto submitFeedback(FeedbackDto feedbackDto) {
        User user = userRepository.findById(feedbackDto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Course course = courseRepository.findById(feedbackDto.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // Upsert: find existing or create new
        Feedback feedback = feedbackRepository.findByUserIdAndCourseId(
                feedbackDto.getUserId(), feedbackDto.getCourseId())
                .orElse(Feedback.builder()
                        .user(user)
                        .course(course)
                        .type(FeedbackType.COURSE_FEEDBACK)
                        .status(FeedbackStatus.OPEN)
                        .isAnonymous(false)
                        .isViolation(false)
                        .build());

        // Update feedback fields
        feedback.setCourseRating(feedbackDto.getCourseRating());
        feedback.setTrainerRating(feedbackDto.getTrainerRating());
        feedback.setContentRating(feedbackDto.getContentRating());
        feedback.setOverallRating(feedbackDto.getOverallRating());
        feedback.setComments(feedbackDto.getComments());
        feedback.setSuggestions(feedbackDto.getSuggestions());
        feedback.setWouldRecommend(feedbackDto.getWouldRecommend());
        if (feedbackDto.getIsAnonymous() != null) feedback.setIsAnonymous(feedbackDto.getIsAnonymous());
        feedback.setSubmittedAt(LocalDateTime.now());

        feedback = feedbackRepository.save(feedback);
        return mapToDto(feedback);
    }

    private FeedbackDto mapToDto(Feedback feedback) {
        // Resolve course: direct course field first, then fallback to session/enrollment
        com.itms.entity.Course course = feedback.getCourse();
        if (course == null && feedback.getSession() != null) {
            course = feedback.getSession().getCourse();
        }
        if (course == null && feedback.getEnrollment() != null
                && feedback.getEnrollment().getSession() != null) {
            course = feedback.getEnrollment().getSession().getCourse();
        }

        return FeedbackDto.builder()
                .id(feedback.getId())
                .courseId(course != null ? course.getId() : null)
                .courseName(course != null ? course.getName() : null)
                .courseRating(feedback.getCourseRating())
                .trainerRating(feedback.getTrainerRating())
                .contentRating(feedback.getContentRating())
                .overallRating(feedback.getOverallRating())
                .comments(feedback.getComments())
                .suggestions(feedback.getSuggestions())
                .wouldRecommend(feedback.getWouldRecommend())
                .isAnonymous(feedback.getIsAnonymous())
                .userName(feedback.getIsAnonymous() != null && feedback.getIsAnonymous() ? null :
                        (feedback.getUser() != null ? feedback.getUser().getFullName() : null))
                .userEmail(feedback.getIsAnonymous() != null && feedback.getIsAnonymous() ? null :
                        (feedback.getUser() != null ? feedback.getUser().getEmail() : null))
                .submittedAt(feedback.getSubmittedAt())
                .type(feedback.getType() != null ? feedback.getType().name() : null)
                .status(feedback.getStatus() != null ? feedback.getStatus().name() : null)
                .recipientId(feedback.getRecipient() != null ? feedback.getRecipient().getId() : null)
                .recipientName(feedback.getRecipient() != null ? feedback.getRecipient().getFullName() : null)
                .isViolation(feedback.getIsViolation())
                .build();
    }

    /**
     * Get feedback for trainer's courses
     */
    public List<FeedbackDto> getFeedbackForTrainer(Integer trainerId) {
        List<Integer> courseIds = courseRepository.findByTrainerId(trainerId)
                .stream()
                .map(com.itms.entity.Course::getId)
                .collect(Collectors.toList());

        if (courseIds.isEmpty()) return List.of();

        return feedbackRepository.findByCourseIdIn(courseIds).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Reply to feedback - Not implemented (database schema doesn't support trainer replies)
     */
    @Transactional
    public void replyToFeedback(Long feedbackId, String reply) {
        // TODO: This functionality requires database schema changes to add trainer_reply and replied_at columns
        throw new RuntimeException("Trainer reply functionality not yet implemented - requires database schema update");
    }

    /**
     * Submit Trainer to Student feedback
     */
    @Transactional
    public FeedbackDto submitTrainerToStudentFeedback(FeedbackDto dto) {
        User trainer = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("Trainer not found"));
        User student = userRepository.findById(dto.getRecipientId())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Feedback feedback = Feedback.builder()
                .user(trainer)
                .recipient(student)
                .type(FeedbackType.TRAINER_TO_STUDENT)
                .status(FeedbackStatus.OPEN)
                .comments(dto.getComments())
                .submittedAt(LocalDateTime.now())
                .build();

        return mapToDto(feedbackRepository.save(feedback));
    }

    /**
     * Report violation to HR
     */
    @Transactional
    public FeedbackDto reportToHr(FeedbackDto dto) {
        User sender = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        Feedback feedback = Feedback.builder()
                .user(sender)
                .type(FeedbackType.REPORT_TO_HR)
                .status(FeedbackStatus.OPEN)
                .comments(dto.getComments())
                .isViolation(true)
                .submittedAt(LocalDateTime.now())
                .build();

        return mapToDto(feedbackRepository.save(feedback));
    }

    /**
     * HR to Admin feedback
     */
    @Transactional
    public FeedbackDto submitHrToAdminFeedback(FeedbackDto dto) {
        User hr = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("HR not found"));

        Feedback feedback = Feedback.builder()
                .user(hr)
                .type(FeedbackType.HR_TO_ADMIN)
                .status(FeedbackStatus.OPEN)
                .comments(dto.getComments())
                .submittedAt(LocalDateTime.now())
                .build();

        return mapToDto(feedbackRepository.save(feedback));
    }

    /**
     * Get reports for HR
     */
    public List<FeedbackDto> getReportsForHr() {
        return feedbackRepository.findByType(FeedbackType.REPORT_TO_HR).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get feedback for student
     */
    public List<FeedbackDto> getFeedbackForStudent(Integer studentId) {
        return feedbackRepository.findByTypeAndRecipientId(FeedbackType.TRAINER_TO_STUDENT, studentId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get all feedback for admin
     */
    public List<FeedbackDto> getAllFeedback() {
        return feedbackRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Mark feedback as resolved
     */
    @Transactional
    public void resolveFeedback(Long id) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feedback not found"));
        feedback.setStatus(FeedbackStatus.RESOLVED);
        feedbackRepository.save(feedback);
    }
}
