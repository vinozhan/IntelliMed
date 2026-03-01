package com.intellimed.payment.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PaymentDto {
    private Long id;
    private Long appointmentId;
    private Long patientId;
    private Long doctorId;
    private BigDecimal amount;
    private String currency;
    private String status;
    private String stripePaymentIntentId;
    private String stripeClientSecret;
    private String paidAt;
}
