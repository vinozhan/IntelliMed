package com.intellimed.patient.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AuthResponse {
    private String token;
    private Long userId;
    private String email;
    private String role;
    private String firstName;
    private String lastName;
}
