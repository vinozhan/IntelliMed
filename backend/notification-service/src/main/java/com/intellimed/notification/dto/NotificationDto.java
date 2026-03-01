package com.intellimed.notification.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NotificationDto {
    private Long id;
    private String recipientEmail;
    private String recipientPhone;
    private String type;
    private String channel;
    private String subject;
    private String body;
    private String status;
    private String errorMessage;
    private String sentAt;
}
