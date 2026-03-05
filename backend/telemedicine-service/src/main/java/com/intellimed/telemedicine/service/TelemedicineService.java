package com.intellimed.telemedicine.service;

import com.intellimed.telemedicine.dto.*;
import com.intellimed.telemedicine.entity.VideoSession;
import com.intellimed.telemedicine.enums.SessionStatus;
import com.intellimed.telemedicine.exception.ResourceNotFoundException;
import com.intellimed.telemedicine.repository.VideoSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TelemedicineService {

    private final VideoSessionRepository sessionRepository;

    public VideoSessionDto createSession(Long doctorId, CreateSessionRequest request) {
        // If an active/waiting session exists, return it
        Optional<VideoSession> existing = sessionRepository.findByAppointmentId(request.getAppointmentId());
        if (existing.isPresent()) {
            VideoSession s = existing.get();
            if (s.getStatus() == SessionStatus.WAITING || s.getStatus() == SessionStatus.ACTIVE) {
                return toDto(s);
            }
            // Previous session ended — remove it so a new one can be created
            sessionRepository.delete(s);
        }

        String roomName = "intellimed-" + request.getAppointmentId() + "-" + UUID.randomUUID().toString().substring(0, 8);

        VideoSession session = VideoSession.builder()
                .appointmentId(request.getAppointmentId())
                .roomName(roomName)
                .doctorId(doctorId)
                .patientId(request.getPatientId())
                .status(SessionStatus.WAITING)
                .build();

        session = sessionRepository.save(session);
        return toDto(session);
    }

    public VideoSessionDto getSessionByAppointment(Long appointmentId) {
        VideoSession session = sessionRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));
        return toDto(session);
    }

    public VideoSessionDto startSession(Long id) {
        VideoSession session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));
        session.setStatus(SessionStatus.ACTIVE);
        session.setStartedAt(LocalDateTime.now());
        session = sessionRepository.save(session);
        return toDto(session);
    }

    public VideoSessionDto endSession(Long id) {
        VideoSession session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));
        session.setStatus(SessionStatus.ENDED);
        session.setEndedAt(LocalDateTime.now());

        if (session.getStartedAt() != null) {
            long minutes = Duration.between(session.getStartedAt(), session.getEndedAt()).toMinutes();
            session.setDurationMinutes((int) minutes);
        }

        session = sessionRepository.save(session);
        return toDto(session);
    }

    public JoinInfoDto getJoinInfo(Long id) {
        VideoSession session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));
        return JoinInfoDto.builder()
                .roomName(session.getRoomName())
                .domain("meet.jit.si")
                .status(session.getStatus().name())
                .build();
    }

    private VideoSessionDto toDto(VideoSession s) {
        return VideoSessionDto.builder()
                .id(s.getId())
                .appointmentId(s.getAppointmentId())
                .roomName(s.getRoomName())
                .doctorId(s.getDoctorId())
                .patientId(s.getPatientId())
                .status(s.getStatus().name())
                .startedAt(s.getStartedAt() != null ? s.getStartedAt().toString() : null)
                .endedAt(s.getEndedAt() != null ? s.getEndedAt().toString() : null)
                .durationMinutes(s.getDurationMinutes())
                .build();
    }
}
