package com.intellimed.doctor.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AvailabilitySlotDto {
    private Long id;
    private Long doctorId;
    private String dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private LocalDate slotDate;
    private Boolean isAvailable;
    private Integer maxPatients;
    private Integer slotDurationMinutes;
}
