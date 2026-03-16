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

    /** Notifications for a user (recipient) by draft flag, newest first. */
    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId AND n.isDraft = :isDraft ORDER BY n.sentDate DESC")
    List<Notification> findByUserIdAndIsDraftOrderBySentDateDesc(
            @Param("userId") Integer userId,
            @Param("isDraft") Boolean isDraft);

    /** Notifications sent by a user (sender), by draft flag, newest first. */
    @Query("SELECT n FROM Notification n WHERE n.sender.id = :senderId AND n.isDraft = :isDraft ORDER BY n.sentDate DESC")
    List<Notification> findBySenderIdAndIsDraftOrderBySentDateDesc(
            @Param("senderId") Integer senderId,
            @Param("isDraft") Boolean isDraft);

}