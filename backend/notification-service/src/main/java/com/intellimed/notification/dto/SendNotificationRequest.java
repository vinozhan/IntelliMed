package com.intellimed.notification.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class SendNotificationRequest {
    private String recipientEmail;
    private String recipientPhone;
    private String type;
    private String channel;
    private String subject;
    private String body;
}
