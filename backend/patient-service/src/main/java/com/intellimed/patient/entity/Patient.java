package com.intellimed.patient.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "patients")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Patient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private Long userId;

    private String dateOfBirth;
    private String gender;
    private String bloodType;
    private String address;
    private String emergencyContact;
    private String profileImageUrl;
}
