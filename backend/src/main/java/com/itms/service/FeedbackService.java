package com.itms.service;

import com.itms.dto.FeedbackDto;
import com.itms.entity.Enrollment;
import com.itms.entity.Feedback;
import com.itms.entity.User;
import com.itms.repository.EnrollmentRepository;
import com.itms.repository.FeedbackRepository;
import com.itms.repository.UserRepository;
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
    private final EnrollmentRepository enrollmentRepository;

    /**
     * Get all feedback for a course
     */
    public List<FeedbackDto> getCourseFeedback(Integer courseId) {
        List<Feedback> feedbacks = feedbackRepository.findByEnrollmentCourseId(courseId);
        return feedbacks.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get user's feedback for a course
     */
    public FeedbackDto getUserFeedback(Integer userId, Integer courseId) {
        return feedbackRepository.findByUserIdAndEnrollmentCourseId(userId, courseId)
                .map(this::mapToDto)
                .orElse(null);
    }

    /**
     * Check if user has submitted feedback for a course
     */
    public boolean hasUserSubmittedFeedback(Integer userId, Integer courseId) {
        return feedbackRepository.existsByUserIdAndEnrollmentCourseId(userId, courseId);
    }

    /**
     * Submit feedback for a course
     */
    @Transactional
    public FeedbackDto submitFeedback(FeedbackDto feedbackDto) {
        User user = userRepository.findById(feedbackDto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Find enrollment for the user and course
        Enrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(feedbackDto.getUserId(), feedbackDto.getCourseId())
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        // Check if feedback already exists
        Feedback feedback = feedbackRepository.findByUserIdAndEnrollmentCourseId(
                feedbackDto.getUserId(), feedbackDto.getCourseId())
                .orElse(Feedback.builder()
                        .user(user)
                        .enrollment(enrollment)
                        .build());

        // Update feedback fields
        feedback.setCourseRating(feedbackDto.getCourseRating());
        feedback.setTrainerRating(feedbackDto.getTrainerRating());
        feedback.setContentRating(feedbackDto.getContentRating());
        feedback.setOverallRating(feedbackDto.getOverallRating());
        feedback.setComments(feedbackDto.getComments());
        feedback.setSuggestions(feedbackDto.getSuggestions());
        feedback.setWouldRecommend(feedbackDto.getWouldRecommend());
        feedback.setIsAnonymous(feedbackDto.getIsAnonymous());
        feedback.setSubmittedAt(LocalDateTime.now());

        feedback = feedbackRepository.save(feedback);
        return mapToDto(feedback);
    }

    private FeedbackDto mapToDto(Feedback feedback) {
        return FeedbackDto.builder()
                .id(feedback.getId())
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
                .build();
    }

    /**
     * Get feedback for trainer's courses
     */
    public List<FeedbackDto> getFeedbackForTrainer(Integer trainerId) {
        List<Feedback> feedbacks = feedbackRepository.findByTrainerId(trainerId);
        return feedbacks.stream()
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
     * Get all feedback for admin
     */
    public List<FeedbackDto> getAllFeedback() {
        List<Feedback> feedbacks = feedbackRepository.findAll();
        return feedbacks.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }
}
