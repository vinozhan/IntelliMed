package com.intellimed.telemedicine.repository;

import com.intellimed.telemedicine.entity.VideoSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface VideoSessionRepository extends JpaRepository<VideoSession, Long> {
    Optional<VideoSession> findByAppointmentId(Long appointmentId);
}
