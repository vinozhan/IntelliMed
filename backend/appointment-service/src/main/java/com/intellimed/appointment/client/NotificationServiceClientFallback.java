package com.intellimed.appointment.client;

import com.intellimed.appointment.dto.SendNotificationRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class NotificationServiceClientFallback implements NotificationServiceClient {

    @Override
    public void sendNotification(SendNotificationRequest request) {
        log.warn("Notification service unavailable — notification skipped for: {}", request.getRecipientEmail());
    }
}
