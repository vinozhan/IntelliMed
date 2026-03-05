package com.intellimed.appointment.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SendNotificationRequest {
    private String recipientEmail;
    private String recipientPhone;
    private String type;
    private String channel;
    private String subject;
    private String body;
}
