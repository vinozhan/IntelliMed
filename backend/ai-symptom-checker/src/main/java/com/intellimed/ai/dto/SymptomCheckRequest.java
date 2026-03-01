package com.intellimed.ai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class SymptomCheckRequest {
    @NotBlank(message = "Symptoms are required")
    private String symptoms;
    private Integer age;
    private String gender;
}
