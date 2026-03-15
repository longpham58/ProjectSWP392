package com.itms.repository;

import com.itms.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {

    List<Notification> findByUserIdOrderBySentDateDesc(Integer userId);
    
    // Find notifications by user and draft status
    List<Notification> findByUserIdAndIsDraftOrderBySentDateDesc(Integer userId, Boolean isDraft);
    
    // Find notifications sent by a specific sender
    List<Notification> findBySenderIdAndIsDraftOrderBySentDateDesc(Integer senderId, Boolean isDraft);

}