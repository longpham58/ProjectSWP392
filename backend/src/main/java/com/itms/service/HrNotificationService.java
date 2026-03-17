package com.itms.service;

import com.itms.common.NotificationPriority;
import com.itms.common.NotificationType;
import com.itms.dto.HrNotificationDto;
import com.itms.entity.Notification;
import com.itms.entity.User;
import com.itms.repository.NotificationRepository;
import com.itms.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class HrNotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public List<HrNotificationDto> getAllBySender(Integer senderId) {
        return notificationRepository.findByUserIdOrderBySentDateDesc(senderId).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public HrNotificationDto create(Integer senderId, HrNotificationDto dto) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy người gửi"));

        Notification entity = new Notification();
        entity.setSender(sender);
        entity.setUser(sender); // keep non-null recipient with existing schema
        applyDto(entity, dto);
        return toDto(notificationRepository.save(entity));
    }

    @Transactional
    public HrNotificationDto update(Integer senderId, Integer id, HrNotificationDto dto) {
        Notification entity = notificationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy thông báo với id: " + id));

        if (entity.getSender() == null || !entity.getSender().getId().equals(senderId)) {
            throw new IllegalArgumentException("Bạn không có quyền cập nhật thông báo này");
        }

        applyDto(entity, dto);
        return toDto(notificationRepository.save(entity));
    }

    @Transactional
    public void delete(Integer senderId, Integer id) {
        Notification entity = notificationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy thông báo với id: " + id));
        if (entity.getSender() == null || !entity.getSender().getId().equals(senderId)) {
            throw new IllegalArgumentException("Bạn không có quyền xóa thông báo này");
        }
        notificationRepository.delete(entity);
    }

    private void applyDto(Notification entity, HrNotificationDto dto) {
        String title = require(dto.getTitle(), "Tiêu đề không được để trống");
        String status = normalizeStatus(dto.getStatus());

        entity.setType(NotificationType.GENERAL);
        entity.setPriority(NotificationPriority.NORMAL);
        entity.setTitle(title);
        entity.setMessage(dto.getContent() == null ? "" : dto.getContent().trim());
        entity.setIsRead(false);

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime sentAt = parseDateTime(dto.getSentAt());
        LocalDateTime scheduledAt = parseDateTime(dto.getScheduledAt());
        if ("Sent".equals(status)) {
            entity.setSentDate(sentAt != null ? sentAt : now);
            entity.setIsDraft(false);
        } else if ("Scheduled".equals(status)) {
            entity.setSentDate(scheduledAt != null ? scheduledAt : now);
            entity.setIsDraft(false);
        } else if ("Cancelled".equals(status)) {
            entity.setSentDate(now);
            entity.setIsDraft(false);
        } else {
            entity.setSentDate(now);
            entity.setIsDraft(true);
        }

        Map<String, String> meta = new HashMap<>();
        meta.put("channel", defaultString(dto.getChannel(), "In-app"));
        meta.put("status", status);
        meta.put("sentTo", defaultString(dto.getSentTo(), ""));
        meta.put("creator", defaultString(dto.getCreator(), "HR"));
        meta.put("scheduledAt", dto.getScheduledAt() == null ? "" : dto.getScheduledAt());
        meta.put("sentAt", dto.getSentAt() == null ? "" : dto.getSentAt());
        entity.setDetailContent(encodeMeta(meta));
    }

    private HrNotificationDto toDto(Notification entity) {
        Map<String, String> meta = decodeMeta(entity.getDetailContent());
        String status = normalizeStatus(meta.get("status"));
        String sentAt = meta.get("sentAt");
        String scheduledAt = meta.get("scheduledAt");
        String channel = defaultString(meta.get("channel"), "In-app");
        String sentTo = defaultString(meta.get("sentTo"), defaultString(entity.getRecipientType(), ""));
        String creator = defaultString(meta.get("creator"),
                entity.getSender() != null ? defaultString(entity.getSender().getFullName(), "HR") : "HR");

        if ((sentAt == null || sentAt.isBlank()) && "Sent".equals(status) && entity.getSentDate() != null) {
            sentAt = entity.getSentDate().toString();
        }
        if ((scheduledAt == null || scheduledAt.isBlank()) && "Scheduled".equals(status) && entity.getSentDate() != null) {
            scheduledAt = entity.getSentDate().toString();
        }
        if (status.isBlank()) {
            status = Boolean.TRUE.equals(entity.getIsDraft()) ? "Draft" : "Sent";
        }

        return HrNotificationDto.builder()
                .id(entity.getId())
                .title(defaultString(entity.getTitle(), ""))
                .content(defaultString(entity.getMessage(), ""))
                .channel(channel)
                .sentTo(sentTo)
                .scheduledAt(scheduledAt)
                .sentAt(sentAt)
                .creator(creator)
                .status(status)
                .build();
    }

    private String encodeMeta(Map<String, String> meta) {
        StringBuilder sb = new StringBuilder();
        for (Map.Entry<String, String> entry : meta.entrySet()) {
            if (sb.length() > 0) {
                sb.append(';');
            }
            sb.append(entry.getKey()).append('=').append(entry.getValue() == null ? "" : entry.getValue().replace(";", ","));
        }
        return sb.toString();
    }

    private Map<String, String> decodeMeta(String value) {
        Map<String, String> result = new HashMap<>();
        if (value == null || value.isBlank()) {
            return result;
        }
        String[] parts = value.split(";");
        for (String part : parts) {
            int idx = part.indexOf('=');
            if (idx <= 0) {
                continue;
            }
            String key = part.substring(0, idx).trim();
            String data = part.substring(idx + 1).trim();
            if (!key.isEmpty()) {
                result.put(key, data);
            }
        }
        return result;
    }

    private String normalizeStatus(String status) {
        if (status == null || status.isBlank()) {
            return "Draft";
        }
        String normalized = status.trim().toLowerCase(Locale.ROOT);
        return switch (normalized) {
            case "sent" -> "Sent";
            case "scheduled" -> "Scheduled";
            case "cancelled" -> "Cancelled";
            default -> "Draft";
        };
    }

    private LocalDateTime parseDateTime(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return LocalDateTime.parse(value);
        } catch (DateTimeParseException ex) {
            return null;
        }
    }

    private String require(String value, String message) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException(message);
        }
        return value.trim();
    }

    private String defaultString(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

}
