package com.itms.repository;

import com.itms.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {

    // Original method - get notifications received by user
    List<Notification> findByUserIdOrderBySentDateDesc(Integer userId);
    
    // Find notifications by user and draft status
    List<Notification> findByUserIdAndIsDraftOrderBySentDateDesc(Integer userId, Boolean isDraft);
    
    // Find notifications sent by a specific sender
    List<Notification> findBySenderIdAndIsDraftOrderBySentDateDesc(Integer senderId, Boolean isDraft);

    // Trainer methods - get notifications sent by trainer (sent)
    @Query("SELECT n FROM Notification n WHERE n.sender.id = :senderId AND n.isDraft = false ORDER BY n.sentDate DESC")
    List<Notification> findSentBySenderId(@Param("senderId") Integer senderId);

    // Trainer methods - get draft notifications
    @Query("SELECT n FROM Notification n WHERE n.sender.id = :senderId AND n.isDraft = true ORDER BY n.updatedAt DESC, n.createdAt DESC")
    List<Notification> findDraftsBySenderId(@Param("senderId") Integer senderId);

    // Get all notifications by sender (both sent and draft)
    List<Notification> findBySenderIdOrderByCreatedAtDesc(Integer senderId);
}