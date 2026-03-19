package com.itms.repository;

import com.itms.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {

    List<Notification> findByUserIdOrderBySentDateDesc(Integer userId);

    // Get notifications for a user including broadcast notifications (where user is null)
    @Query("SELECT n FROM Notification n WHERE (n.user.id = :userId OR n.user IS NULL) AND n.isDraft = false ORDER BY n.sentDate DESC")
    List<Notification> findNotificationsForUser(@Param("userId") Integer userId);

    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId AND n.isDraft = :isDraft ORDER BY n.sentDate DESC")
    List<Notification> findByUserIdAndIsDraftOrderBySentDateDesc(
            @Param("userId") Integer userId,
            @Param("isDraft") Boolean isDraft);

    @Query("SELECT n FROM Notification n WHERE n.sender.id = :senderId AND n.isDraft = :isDraft ORDER BY n.sentDate DESC")
    List<Notification> findBySenderIdAndIsDraftOrderBySentDateDesc(
            @Param("senderId") Integer senderId,
            @Param("isDraft") Boolean isDraft);

    @Query("SELECT n FROM Notification n WHERE n.sender.id = :senderId AND n.isDraft = false ORDER BY n.sentDate DESC")
    List<Notification> findSentBySenderId(@Param("senderId") Integer senderId);

    @Query("SELECT n FROM Notification n WHERE n.sender.id = :senderId AND n.isDraft = true ORDER BY n.sentDate DESC")
    List<Notification> findDraftsBySenderId(@Param("senderId") Integer senderId);

    // Get recent notifications ordered by sent date
    @Query("SELECT n FROM Notification n ORDER BY n.sentDate DESC")
    List<Notification> findRecentNotifications();

    // Get recent notifications with limit
    @Query("SELECT n FROM Notification n ORDER BY n.sentDate DESC")
    List<Notification> findTopRecentNotifications(org.springframework.data.domain.Pageable pageable);

    // Get all notifications for admin (not filtered by user)
    @Query("SELECT n FROM Notification n WHERE n.isDraft = :isDraft ORDER BY n.sentDate DESC")
    List<Notification> findAllByIsDraft(@Param("isDraft") Boolean isDraft);

    // Count all notifications
    long count();

    // Count by isDraft
    long countByIsDraft(Boolean isDraft);
}
