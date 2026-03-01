package com.intellimed.doctor.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "availability_slots")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AvailabilitySlot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long doctorId;

    private String dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private LocalDate slotDate;

    @Builder.Default
    private Boolean isAvailable = true;

    @Builder.Default
    private Integer maxPatients = 1;
}
