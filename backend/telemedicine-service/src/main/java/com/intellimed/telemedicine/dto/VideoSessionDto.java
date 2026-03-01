package com.intellimed.telemedicine.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class VideoSessionDto {
    private Long id;
    private Long appointmentId;
    private String roomName;
    private Long doctorId;
    private Long patientId;
    private String status;
    private String startedAt;
    private String endedAt;
    private Integer durationMinutes;
}
