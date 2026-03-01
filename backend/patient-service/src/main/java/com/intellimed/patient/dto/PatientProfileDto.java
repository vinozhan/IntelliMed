package com.intellimed.patient.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PatientProfileDto {
    private Long id;
    private Long userId;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String dateOfBirth;
    private String gender;
    private String bloodType;
    private String address;
    private String emergencyContact;
    private String profileImageUrl;
}
