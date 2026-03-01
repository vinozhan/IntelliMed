package com.intellimed.notification.controller;

import com.intellimed.notification.dto.NotificationDto;
import com.intellimed.notification.dto.SendNotificationRequest;
import com.intellimed.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping("/send")
    public ResponseEntity<NotificationDto> sendNotification(@RequestBody SendNotificationRequest request) {
        return ResponseEntity.ok(notificationService.sendNotification(request));
    }

    @PostMapping("/email")
    public ResponseEntity<NotificationDto> sendEmail(@RequestBody SendNotificationRequest request) {
        request.setChannel("EMAIL");
        return ResponseEntity.ok(notificationService.sendNotification(request));
    }

    @PostMapping("/sms")
    public ResponseEntity<NotificationDto> sendSms(@RequestBody SendNotificationRequest request) {
        request.setChannel("SMS");
        return ResponseEntity.ok(notificationService.sendNotification(request));
    }

    @GetMapping
    public ResponseEntity<List<NotificationDto>> getAllNotifications() {
        return ResponseEntity.ok(notificationService.getAllNotifications());
    }
}
