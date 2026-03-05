package com.intellimed.appointment.service;

import com.intellimed.appointment.client.DoctorServiceClient;
import com.intellimed.appointment.client.NotificationServiceClient;
import com.intellimed.appointment.client.PatientServiceClient;
import com.intellimed.appointment.dto.AppointmentCreateRequest;
import com.intellimed.appointment.dto.AppointmentDto;
import com.intellimed.appointment.entity.Appointment;
import com.intellimed.appointment.enums.AppointmentStatus;
import com.intellimed.appointment.exception.ResourceNotFoundException;
import com.intellimed.appointment.repository.AppointmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private DoctorServiceClient doctorServiceClient;

    @Mock
    private NotificationServiceClient notificationServiceClient;

    @Mock
    private PatientServiceClient patientServiceClient;

    @InjectMocks
    private AppointmentService appointmentService;

    private AppointmentCreateRequest createRequest;
    private Map<String, Object> doctorMap;
    private Map<String, Object> patientMap;
    private Map<String, Object> slotMap;
    private Appointment savedAppointment;

    private static final Long PATIENT_ID = 1L;
    private static final Long DOCTOR_ID = 10L;
    private static final Long DOCTOR_USER_ID = 100L;
    private static final Long APPOINTMENT_ID = 50L;
    private static final Long SLOT_ID = 200L;
    private static final LocalDate DATE = LocalDate.of(2026, 4, 15);
    private static final LocalTime START = LocalTime.of(9, 0);
    private static final LocalTime END = LocalTime.of(9, 30);

    @BeforeEach
    void setUp() {
        createRequest = new AppointmentCreateRequest();
        createRequest.setDoctorId(DOCTOR_ID);
        createRequest.setAppointmentDate(DATE);
        createRequest.setStartTime(START);
        createRequest.setEndTime(END);
        createRequest.setReason("Checkup");

        doctorMap = new HashMap<>();
        doctorMap.put("id", DOCTOR_ID);
        doctorMap.put("userId", DOCTOR_USER_ID);
        doctorMap.put("firstName", "John");
        doctorMap.put("lastName", "Smith");

        patientMap = new HashMap<>();
        patientMap.put("email", "patient@test.com");
        patientMap.put("firstName", "Jane");
        patientMap.put("lastName", "Doe");

        slotMap = new HashMap<>();
        slotMap.put("id", SLOT_ID);
        slotMap.put("isAvailable", true);

        savedAppointment = Appointment.builder()
                .id(APPOINTMENT_ID)
                .patientId(PATIENT_ID)
                .doctorId(DOCTOR_ID)
                .doctorUserId(DOCTOR_USER_ID)
                .appointmentDate(DATE)
                .startTime(START)
                .endTime(END)
                .reason("Checkup")
                .status(AppointmentStatus.PENDING)
                .slotId(SLOT_ID)
                .build();
    }

    // ---- createAppointment ----

    @Test
    @DisplayName("createAppointment - success")
    void createAppointment_success() {
        when(doctorServiceClient.getDoctorById(DOCTOR_ID)).thenReturn(doctorMap);
        when(appointmentRepository.existsOverlappingAppointment(DOCTOR_ID, DATE, START, END)).thenReturn(false);
        when(doctorServiceClient.findSlot(eq(DOCTOR_ID), anyString(), anyString())).thenReturn(slotMap);
        when(doctorServiceClient.consumeSlot(SLOT_ID)).thenReturn(slotMap);
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(savedAppointment);
        when(patientServiceClient.getPatientById(PATIENT_ID)).thenReturn(patientMap);

        AppointmentDto result = appointmentService.createAppointment(PATIENT_ID, createRequest);

        assertNotNull(result);
        assertEquals(APPOINTMENT_ID, result.getId());
        assertEquals("PENDING", result.getStatus());
        assertEquals(DOCTOR_ID, result.getDoctorId());
        assertEquals(PATIENT_ID, result.getPatientId());
        verify(appointmentRepository).save(any(Appointment.class));
        verify(doctorServiceClient).consumeSlot(SLOT_ID);
    }

    @Test
    @DisplayName("createAppointment - double booking throws exception")
    void createAppointment_doubleBooking_throwsException() {
        when(doctorServiceClient.getDoctorById(DOCTOR_ID)).thenReturn(doctorMap);
        when(appointmentRepository.existsOverlappingAppointment(DOCTOR_ID, DATE, START, END)).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> appointmentService.createAppointment(PATIENT_ID, createRequest));

        assertTrue(ex.getMessage().contains("already booked"));
        verify(appointmentRepository, never()).save(any());
    }

    @Test
    @DisplayName("createAppointment - doctor not found throws exception")
    void createAppointment_doctorNotFound_throwsException() {
        when(doctorServiceClient.getDoctorById(DOCTOR_ID)).thenThrow(new RuntimeException("Not found"));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> appointmentService.createAppointment(PATIENT_ID, createRequest));

        assertTrue(ex.getMessage().contains("Doctor not found"));
        verify(appointmentRepository, never()).save(any());
    }

    // ---- getAppointment ----

    @Test
    @DisplayName("getAppointment - found")
    void getAppointment_found() {
        when(appointmentRepository.findById(APPOINTMENT_ID)).thenReturn(Optional.of(savedAppointment));

        AppointmentDto result = appointmentService.getAppointment(APPOINTMENT_ID);

        assertNotNull(result);
        assertEquals(APPOINTMENT_ID, result.getId());
        assertEquals("PENDING", result.getStatus());
    }

    @Test
    @DisplayName("getAppointment - not found throws exception")
    void getAppointment_notFound_throwsException() {
        when(appointmentRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> appointmentService.getAppointment(999L));
    }

    // ---- confirmAppointment ----

    @Test
    @DisplayName("confirmAppointment - success")
    void confirmAppointment_success() {
        Appointment confirmed = Appointment.builder()
                .id(APPOINTMENT_ID).patientId(PATIENT_ID).doctorId(DOCTOR_ID)
                .doctorUserId(DOCTOR_USER_ID).appointmentDate(DATE)
                .startTime(START).endTime(END)
                .status(AppointmentStatus.CONFIRMED).build();

        when(appointmentRepository.findById(APPOINTMENT_ID)).thenReturn(Optional.of(savedAppointment));
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(confirmed);

        AppointmentDto result = appointmentService.confirmAppointment(APPOINTMENT_ID, DOCTOR_USER_ID);

        assertEquals("CONFIRMED", result.getStatus());
        verify(appointmentRepository).save(any(Appointment.class));
    }

    @Test
    @DisplayName("confirmAppointment - wrong doctor throws exception")
    void confirmAppointment_wrongDoctor_throwsException() {
        when(appointmentRepository.findById(APPOINTMENT_ID)).thenReturn(Optional.of(savedAppointment));

        Long wrongDoctorUserId = 999L;
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> appointmentService.confirmAppointment(APPOINTMENT_ID, wrongDoctorUserId));

        assertTrue(ex.getMessage().contains("Only the assigned doctor"));
        verify(appointmentRepository, never()).save(any());
    }

    @Test
    @DisplayName("confirmAppointment - not pending throws exception")
    void confirmAppointment_notPending_throwsException() {
        savedAppointment.setStatus(AppointmentStatus.CONFIRMED);
        when(appointmentRepository.findById(APPOINTMENT_ID)).thenReturn(Optional.of(savedAppointment));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> appointmentService.confirmAppointment(APPOINTMENT_ID, DOCTOR_USER_ID));

        assertTrue(ex.getMessage().contains("Only PENDING"));
        verify(appointmentRepository, never()).save(any());
    }

    // ---- cancelAppointment ----

    @Test
    @DisplayName("cancelAppointment - success releases slot")
    void cancelAppointment_success_releasesSlot() {
        Appointment cancelled = Appointment.builder()
                .id(APPOINTMENT_ID).patientId(PATIENT_ID).doctorId(DOCTOR_ID)
                .doctorUserId(DOCTOR_USER_ID).appointmentDate(DATE)
                .startTime(START).endTime(END)
                .status(AppointmentStatus.CANCELLED)
                .cancellationReason("No longer needed").build();

        when(appointmentRepository.findById(APPOINTMENT_ID)).thenReturn(Optional.of(savedAppointment));
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(cancelled);

        AppointmentDto result = appointmentService.cancelAppointment(APPOINTMENT_ID, PATIENT_ID, "PATIENT", "No longer needed");

        assertEquals("CANCELLED", result.getStatus());
        verify(doctorServiceClient).releaseSlot(SLOT_ID);
        verify(appointmentRepository).save(any(Appointment.class));
    }

    @Test
    @DisplayName("cancelAppointment - not authorized throws exception")
    void cancelAppointment_notAuthorized_throwsException() {
        when(appointmentRepository.findById(APPOINTMENT_ID)).thenReturn(Optional.of(savedAppointment));

        Long unauthorizedUserId = 999L;
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> appointmentService.cancelAppointment(APPOINTMENT_ID, unauthorizedUserId, "PATIENT", "reason"));

        assertTrue(ex.getMessage().contains("not authorized"));
        verify(appointmentRepository, never()).save(any());
    }

    // ---- rejectAppointment ----

    @Test
    @DisplayName("rejectAppointment - success releases slot")
    void rejectAppointment_success_releasesSlot() {
        Appointment rejected = Appointment.builder()
                .id(APPOINTMENT_ID).patientId(PATIENT_ID).doctorId(DOCTOR_ID)
                .doctorUserId(DOCTOR_USER_ID).appointmentDate(DATE)
                .startTime(START).endTime(END)
                .status(AppointmentStatus.REJECTED)
                .cancellationReason("Schedule conflict").build();

        when(appointmentRepository.findById(APPOINTMENT_ID)).thenReturn(Optional.of(savedAppointment));
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(rejected);

        AppointmentDto result = appointmentService.rejectAppointment(APPOINTMENT_ID, DOCTOR_USER_ID, "Schedule conflict");

        assertEquals("REJECTED", result.getStatus());
        verify(doctorServiceClient).releaseSlot(SLOT_ID);
        verify(appointmentRepository).save(any(Appointment.class));
    }

    // ---- completeAppointment ----

    @Test
    @DisplayName("completeAppointment - success")
    void completeAppointment_success() {
        savedAppointment.setStatus(AppointmentStatus.CONFIRMED);

        Appointment completed = Appointment.builder()
                .id(APPOINTMENT_ID).patientId(PATIENT_ID).doctorId(DOCTOR_ID)
                .doctorUserId(DOCTOR_USER_ID).appointmentDate(DATE)
                .startTime(START).endTime(END)
                .status(AppointmentStatus.COMPLETED).build();

        when(appointmentRepository.findById(APPOINTMENT_ID)).thenReturn(Optional.of(savedAppointment));
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(completed);

        AppointmentDto result = appointmentService.completeAppointment(APPOINTMENT_ID, DOCTOR_USER_ID);

        assertEquals("COMPLETED", result.getStatus());
        verify(appointmentRepository).save(any(Appointment.class));
    }
}
