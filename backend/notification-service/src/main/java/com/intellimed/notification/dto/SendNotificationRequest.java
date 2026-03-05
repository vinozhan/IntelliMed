package com.intellimed.notification.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class SendNotificationRequest {
    private String recipientEmail;
    private String recipientPhone;
    @NotBlank(message = "Notification type is required")
    private String type;
    @NotBlank(message = "Channel is required")
    private String channel;
    @NotBlank(message = "Subject is required")
    private String subject;
    @NotBlank(message = "Body is required")
    private String body;
}
