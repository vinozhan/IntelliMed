package com.intellimed.notification.service;

import com.intellimed.notification.dto.NotificationDto;
import com.intellimed.notification.dto.SendNotificationRequest;
import com.intellimed.notification.entity.NotificationLog;
import com.intellimed.notification.enums.*;
import com.intellimed.notification.repository.NotificationLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationLogRepository logRepository;
    private final EmailService emailService;
    private final SmsService smsService;

    public NotificationDto sendNotification(SendNotificationRequest request) {
        NotificationLog notifLog = NotificationLog.builder()
                .recipientEmail(request.getRecipientEmail())
                .recipientPhone(request.getRecipientPhone())
                .type(request.getType() != null ? NotificationType.valueOf(request.getType()) : NotificationType.GENERAL)
                .channel(request.getChannel() != null ? NotificationChannel.valueOf(request.getChannel()) : NotificationChannel.EMAIL)
                .subject(request.getSubject())
                .body(request.getBody())
                .status(NotificationStatus.PENDING)
                .build();

        try {
            NotificationChannel channel = notifLog.getChannel();

            if (channel == NotificationChannel.EMAIL || channel == NotificationChannel.BOTH) {
                if (request.getRecipientEmail() != null) {
                    emailService.sendEmail(request.getRecipientEmail(), request.getSubject(), request.getBody());
                }
            }

            if (channel == NotificationChannel.SMS || channel == NotificationChannel.BOTH) {
                if (request.getRecipientPhone() != null) {
                    smsService.sendSms(request.getRecipientPhone(), request.getBody());
                }
            }

            notifLog.setStatus(NotificationStatus.SENT);
        } catch (Exception e) {
            notifLog.setStatus(NotificationStatus.FAILED);
            notifLog.setErrorMessage(e.getMessage());
            log.error("Notification failed: {}", e.getMessage());
        }

        notifLog = logRepository.save(notifLog);
        return toDto(notifLog);
    }

    public List<NotificationDto> getAllNotifications() {
        return logRepository.findAllByOrderBySentAtDesc()
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public Page<NotificationDto> getAllNotifications(int page, int size) {
        return logRepository.findAllByOrderBySentAtDesc(PageRequest.of(page, size))
                .map(this::toDto);
    }

    private NotificationDto toDto(NotificationLog n) {
        return NotificationDto.builder()
                .id(n.getId())
                .recipientEmail(n.getRecipientEmail())
                .recipientPhone(n.getRecipientPhone())
                .type(n.getType() != null ? n.getType().name() : null)
                .channel(n.getChannel() != null ? n.getChannel().name() : null)
                .subject(n.getSubject())
                .body(n.getBody())
                .status(n.getStatus().name())
                .errorMessage(n.getErrorMessage())
                .sentAt(n.getSentAt() != null ? n.getSentAt().toString() : null)
                .build();
    }
}
