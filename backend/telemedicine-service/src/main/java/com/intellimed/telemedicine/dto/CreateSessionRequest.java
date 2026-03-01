package com.intellimed.telemedicine.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CreateSessionRequest {
    @NotNull
    private Long appointmentId;
    @NotNull
    private Long patientId;
}
