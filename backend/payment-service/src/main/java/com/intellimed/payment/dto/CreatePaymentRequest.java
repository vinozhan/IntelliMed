package com.intellimed.payment.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CreatePaymentRequest {
    @NotNull
    private Long appointmentId;
    @NotNull
    private Long doctorId;
    @NotNull
    private BigDecimal amount;
    private String currency;
}
