package com.intellimed.ai.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "symptom_check_logs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SymptomCheckLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long patientId;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String symptoms;

    @Column(columnDefinition = "TEXT")
    private String aiResponse;

    private String recommendedSpecialty;
    private String severityLevel;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
