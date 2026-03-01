package com.intellimed.appointment.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class AppointmentCreateRequest {
    @NotNull
    private Long doctorId;
    @NotNull
    private LocalDate appointmentDate;
    @NotNull
    private LocalTime startTime;
    private LocalTime endTime;
    private String reason;
}
