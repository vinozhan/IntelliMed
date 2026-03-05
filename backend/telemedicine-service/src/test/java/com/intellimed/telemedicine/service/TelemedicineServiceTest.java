package com.intellimed.telemedicine.service;

import com.intellimed.telemedicine.dto.CreateSessionRequest;
import com.intellimed.telemedicine.dto.VideoSessionDto;
import com.intellimed.telemedicine.entity.VideoSession;
import com.intellimed.telemedicine.enums.SessionStatus;
import com.intellimed.telemedicine.exception.ResourceNotFoundException;
import com.intellimed.telemedicine.repository.VideoSessionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TelemedicineServiceTest {

    @Mock
    private VideoSessionRepository sessionRepository;

    @InjectMocks
    private TelemedicineService telemedicineService;

    private CreateSessionRequest createRequest;
    private VideoSession waitingSession;

    private static final Long SESSION_ID = 1L;
    private static final Long DOCTOR_ID = 10L;
    private static final Long PATIENT_ID = 20L;
    private static final Long APPOINTMENT_ID = 30L;
    private static final String ROOM_NAME = "intellimed-30-abc12345";

    @BeforeEach
    void setUp() {
        createRequest = new CreateSessionRequest();
        createRequest.setAppointmentId(APPOINTMENT_ID);
        createRequest.setPatientId(PATIENT_ID);

        waitingSession = VideoSession.builder()
                .id(SESSION_ID)
                .appointmentId(APPOINTMENT_ID)
                .roomName(ROOM_NAME)
                .doctorId(DOCTOR_ID)
                .patientId(PATIENT_ID)
                .status(SessionStatus.WAITING)
                .build();
    }

    // ---- createSession ----

    @Test
    @DisplayName("createSession - success (no existing session)")
    void createSession_success() {
        when(sessionRepository.findByAppointmentId(APPOINTMENT_ID)).thenReturn(Optional.empty());
        when(sessionRepository.save(any(VideoSession.class))).thenReturn(waitingSession);

        VideoSessionDto result = telemedicineService.createSession(DOCTOR_ID, createRequest);

        assertNotNull(result);
        assertEquals(APPOINTMENT_ID, result.getAppointmentId());
        assertEquals(DOCTOR_ID, result.getDoctorId());
        assertEquals(PATIENT_ID, result.getPatientId());
        assertEquals("WAITING", result.getStatus());
        verify(sessionRepository).save(any(VideoSession.class));
    }

    @Test
    @DisplayName("createSession - existing active session returns existing")
    void createSession_existingActive_returnsExisting() {
        VideoSession activeSession = VideoSession.builder()
                .id(SESSION_ID)
                .appointmentId(APPOINTMENT_ID)
                .roomName(ROOM_NAME)
                .doctorId(DOCTOR_ID)
                .patientId(PATIENT_ID)
                .status(SessionStatus.ACTIVE)
                .startedAt(LocalDateTime.now())
                .build();

        when(sessionRepository.findByAppointmentId(APPOINTMENT_ID)).thenReturn(Optional.of(activeSession));

        VideoSessionDto result = telemedicineService.createSession(DOCTOR_ID, createRequest);

        assertNotNull(result);
        assertEquals("ACTIVE", result.getStatus());
        verify(sessionRepository, never()).save(any());
    }

    // ---- getSessionByAppointment ----

    @Test
    @DisplayName("getSessionByAppointment - found")
    void getSessionByAppointment_found() {
        when(sessionRepository.findByAppointmentId(APPOINTMENT_ID)).thenReturn(Optional.of(waitingSession));

        VideoSessionDto result = telemedicineService.getSessionByAppointment(APPOINTMENT_ID);

        assertNotNull(result);
        assertEquals(APPOINTMENT_ID, result.getAppointmentId());
        assertEquals("WAITING", result.getStatus());
    }

    @Test
    @DisplayName("getSessionByAppointment - not found throws exception")
    void getSessionByAppointment_notFound_throwsException() {
        when(sessionRepository.findByAppointmentId(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> telemedicineService.getSessionByAppointment(999L));
    }

    // ---- startSession ----

    @Test
    @DisplayName("startSession - success")
    void startSession_success() {
        VideoSession activeSession = VideoSession.builder()
                .id(SESSION_ID)
                .appointmentId(APPOINTMENT_ID)
                .roomName(ROOM_NAME)
                .doctorId(DOCTOR_ID)
                .patientId(PATIENT_ID)
                .status(SessionStatus.ACTIVE)
                .startedAt(LocalDateTime.now())
                .build();

        when(sessionRepository.findById(SESSION_ID)).thenReturn(Optional.of(waitingSession));
        when(sessionRepository.save(any(VideoSession.class))).thenReturn(activeSession);

        VideoSessionDto result = telemedicineService.startSession(SESSION_ID);

        assertEquals("ACTIVE", result.getStatus());
        assertNotNull(result.getStartedAt());
        verify(sessionRepository).save(argThat(s -> s.getStatus() == SessionStatus.ACTIVE));
    }

    // ---- endSession ----

    @Test
    @DisplayName("endSession - calculates duration")
    void endSession_calculatesDuration() {
        LocalDateTime startTime = LocalDateTime.now().minusMinutes(45);
        VideoSession activeSession = VideoSession.builder()
                .id(SESSION_ID)
                .appointmentId(APPOINTMENT_ID)
                .roomName(ROOM_NAME)
                .doctorId(DOCTOR_ID)
                .patientId(PATIENT_ID)
                .status(SessionStatus.ACTIVE)
                .startedAt(startTime)
                .build();

        VideoSession endedSession = VideoSession.builder()
                .id(SESSION_ID)
                .appointmentId(APPOINTMENT_ID)
                .roomName(ROOM_NAME)
                .doctorId(DOCTOR_ID)
                .patientId(PATIENT_ID)
                .status(SessionStatus.ENDED)
                .startedAt(startTime)
                .endedAt(LocalDateTime.now())
                .durationMinutes(45)
                .build();

        when(sessionRepository.findById(SESSION_ID)).thenReturn(Optional.of(activeSession));
        when(sessionRepository.save(any(VideoSession.class))).thenReturn(endedSession);

        VideoSessionDto result = telemedicineService.endSession(SESSION_ID);

        assertEquals("ENDED", result.getStatus());
        assertNotNull(result.getDurationMinutes());
        assertEquals(45, result.getDurationMinutes());
        verify(sessionRepository).save(argThat(s ->
                s.getStatus() == SessionStatus.ENDED && s.getDurationMinutes() != null));
    }
}
