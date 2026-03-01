package com.intellimed.doctor.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class DoctorCreateRequest {
    @NotBlank
    private String specialty;
    @NotBlank
    private String qualification;
    private Integer experienceYears;
    private Double consultationFee;
    private String hospital;
}
