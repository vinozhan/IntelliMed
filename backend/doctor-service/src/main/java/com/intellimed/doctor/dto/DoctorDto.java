package com.intellimed.doctor.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DoctorDto {
    private Long id;
    private Long userId;
    private String specialty;
    private String qualification;
    private Integer experienceYears;
    private Double consultationFee;
    private String hospital;
    private Boolean isVerified;
    private Double rating;
    private String firstName;
    private String lastName;
}
