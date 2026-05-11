package com.inventory_sales_hub.app.model.service;

import com.inventory_sales_hub.app.exceptions.NotificationException;
import com.inventory_sales_hub.app.model.dto.NotificationResponse;
import com.inventory_sales_hub.app.model.entities.Notification;
import com.inventory_sales_hub.app.model.persistence.NotificationDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationManager {

    @Autowired
    private NotificationDao notificationDao;

    public List<NotificationResponse> getForUser(Long userId) {
        return notificationDao.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public NotificationResponse markRead(Long id, Long userId) {
        Notification notification = notificationDao.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new NotificationException("Notification not found"));
        notification.setRead(true);
        return toResponse(notificationDao.save(notification));
    }

    @Transactional
    public void markAllRead(Long userId) {
        notificationDao.markAllReadByUserId(userId);
    }

    private NotificationResponse toResponse(Notification n) {
        return new NotificationResponse(n.getId(), n.getMessage(), n.getType(), n.isRead(), n.getCreatedAt());
    }
}
