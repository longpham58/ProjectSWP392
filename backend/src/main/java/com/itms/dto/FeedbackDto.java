package com.itms.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FeedbackDto {

    private Long id;
    
    private Integer courseId;
    
    // Rating fields
    private Integer courseRating;
    private Integer trainerRating;
    private Integer contentRating;
    private Integer overallRating;
    
    // User ID for submission
    private Integer userId;
    
    // Comment fields
    private String comments;
    private String suggestions;
    
    // Extra info
    private Boolean wouldRecommend;
    private Boolean isAnonymous;
    
    // User info (may be null if anonymous)
    private String userName;
    private String userEmail;
    
    // Submission time
    private LocalDateTime submittedAt;

    private String type;
    private String status;
    private Integer recipientId;
    private String recipientName;
    private Boolean isViolation;

    /**
     * Build FeedbackDto from Feedback entity
     */
    public static FeedbackDto fromEntity(com.itms.entity.Feedback feedback) {
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
                .submittedAt(feedback.getSubmittedAt())
                .type(feedback.getType() != null ? feedback.getType().name() : null)
                .status(feedback.getStatus() != null ? feedback.getStatus().name() : null)
                .recipientId(feedback.getRecipient() != null ? feedback.getRecipient().getId() : null)
                .recipientName(feedback.getRecipient() != null ? feedback.getRecipient().getFullName() : null)
                .isViolation(feedback.getIsViolation())
                .build();
    }

    /**
     * Build FeedbackDto from Feedback entity with user info
     */
    public static FeedbackDto fromEntityWithUser(com.itms.entity.Feedback feedback) {
        FeedbackDto dto = fromEntity(feedback);
        
        if (feedback.getIsAnonymous() == null || !feedback.getIsAnonymous()) {
            if (feedback.getUser() != null) {
                dto.setUserName(feedback.getUser().getFullName());
                dto.setUserEmail(feedback.getUser().getEmail());
            }
        }
        
        return dto;
    }
}
