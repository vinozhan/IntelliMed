package com.intellimed.telemedicine.entity;

import com.intellimed.telemedicine.enums.SessionStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "video_sessions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class VideoSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long appointmentId;

    @Column(nullable = false, unique = true)
    private String roomName;

    @Column(nullable = false)
    private Long doctorId;

    @Column(nullable = false)
    private Long patientId;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private SessionStatus status = SessionStatus.WAITING;

    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private Integer durationMinutes;
}
