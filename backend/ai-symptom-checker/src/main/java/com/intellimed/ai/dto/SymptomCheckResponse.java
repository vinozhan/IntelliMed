package com.intellimed.ai.dto;

import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SymptomCheckResponse {
    private Long id;
    private String symptoms;
    private List<String> possibleConditions;
    private String recommendedSpecialty;
    private String severityLevel;
    private String advice;
    private String disclaimer;
    private String createdAt;
}
