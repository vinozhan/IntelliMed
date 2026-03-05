package com.intellimed.doctor.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class DoctorCreateRequest {
    @NotBlank
    private String specialty;
    @NotBlank
    private String qualification;
    @Min(value = 0, message = "Experience years must be non-negative")
    private Integer experienceYears;
    @Positive(message = "Consultation fee must be positive")
    private Double consultationFee;
    private String hospital;
}
