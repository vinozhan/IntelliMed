package com.intellimed.doctor.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PrescriptionDto {
    private Long id;
    private Long appointmentId;
    private Long doctorId;
    private Long patientId;
    private String diagnosis;
    private String medications;
    private String instructions;
    private String notes;
}
