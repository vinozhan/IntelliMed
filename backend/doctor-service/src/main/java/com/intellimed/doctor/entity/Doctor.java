package com.intellimed.doctor.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "doctors")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Doctor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private Long userId;

    private String firstName;
    private String lastName;

    private String specialty;
    private String qualification;
    private Integer experienceYears;
    private Double consultationFee;
    private String hospital;

    @Builder.Default
    private Boolean isVerified = false;

    @Builder.Default
    private Double rating = 0.0;
}
