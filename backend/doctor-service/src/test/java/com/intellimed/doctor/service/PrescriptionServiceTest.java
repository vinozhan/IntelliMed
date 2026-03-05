package com.intellimed.doctor.service;

import com.intellimed.doctor.client.AppointmentServiceClient;
import com.intellimed.doctor.dto.PrescriptionDto;
import com.intellimed.doctor.entity.Doctor;
import com.intellimed.doctor.entity.Prescription;
import com.intellimed.doctor.exception.ResourceNotFoundException;
import com.intellimed.doctor.repository.DoctorRepository;
import com.intellimed.doctor.repository.PrescriptionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PrescriptionServiceTest {

    @Mock
    private PrescriptionRepository prescriptionRepository;

    @Mock
    private DoctorRepository doctorRepository;

    @Mock
    private AppointmentServiceClient appointmentServiceClient;

    @InjectMocks
    private PrescriptionService prescriptionService;

    private Doctor doctor;
    private Prescription prescription;
    private PrescriptionDto prescriptionDto;
    private Map<String, Object> appointmentMap;

    private static final Long USER_ID = 1L;
    private static final Long DOCTOR_ID = 10L;
    private static final Long PATIENT_ID = 20L;
    private static final Long APPOINTMENT_ID = 30L;
    private static final Long PRESCRIPTION_ID = 40L;

    @BeforeEach
    void setUp() {
        doctor = Doctor.builder()
                .id(DOCTOR_ID)
                .userId(USER_ID)
                .firstName("John")
                .lastName("Smith")
                .build();

        prescription = Prescription.builder()
                .id(PRESCRIPTION_ID)
                .appointmentId(APPOINTMENT_ID)
                .doctorId(DOCTOR_ID)
                .patientId(PATIENT_ID)
                .diagnosis("Common cold")
                .medications("Paracetamol 500mg")
                .instructions("Take twice daily")
                .notes("Follow up in 1 week")
                .build();

        prescriptionDto = PrescriptionDto.builder()
                .appointmentId(APPOINTMENT_ID)
                .patientId(PATIENT_ID)
                .diagnosis("Common cold")
                .medications("Paracetamol 500mg")
                .instructions("Take twice daily")
                .notes("Follow up in 1 week")
                .build();

        appointmentMap = new HashMap<>();
        appointmentMap.put("id", APPOINTMENT_ID);
        appointmentMap.put("status", "CONFIRMED");
        appointmentMap.put("doctorId", DOCTOR_ID);
    }

    // ---- createPrescription ----

    @Test
    @DisplayName("createPrescription - success")
    void createPrescription_success() {
        when(doctorRepository.findByUserId(USER_ID)).thenReturn(Optional.of(doctor));
        when(appointmentServiceClient.getAppointmentById(APPOINTMENT_ID)).thenReturn(appointmentMap);
        when(prescriptionRepository.save(any(Prescription.class))).thenReturn(prescription);

        PrescriptionDto result = prescriptionService.createPrescription(USER_ID, prescriptionDto);

        assertNotNull(result);
        assertEquals(PRESCRIPTION_ID, result.getId());
        assertEquals("Common cold", result.getDiagnosis());
        assertEquals("Paracetamol 500mg", result.getMedications());
        verify(prescriptionRepository).save(any(Prescription.class));
    }

    @Test
    @DisplayName("createPrescription - wrong appointment status throws exception")
    void createPrescription_wrongAppointmentStatus_throwsException() {
        appointmentMap.put("status", "PENDING");

        when(doctorRepository.findByUserId(USER_ID)).thenReturn(Optional.of(doctor));
        when(appointmentServiceClient.getAppointmentById(APPOINTMENT_ID)).thenReturn(appointmentMap);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> prescriptionService.createPrescription(USER_ID, prescriptionDto));

        assertTrue(ex.getMessage().contains("CONFIRMED or COMPLETED"));
        verify(prescriptionRepository, never()).save(any());
    }

    @Test
    @DisplayName("createPrescription - wrong doctor throws exception")
    void createPrescription_wrongDoctor_throwsException() {
        appointmentMap.put("doctorId", 999L); // different doctor

        when(doctorRepository.findByUserId(USER_ID)).thenReturn(Optional.of(doctor));
        when(appointmentServiceClient.getAppointmentById(APPOINTMENT_ID)).thenReturn(appointmentMap);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> prescriptionService.createPrescription(USER_ID, prescriptionDto));

        assertTrue(ex.getMessage().contains("your own appointments"));
        verify(prescriptionRepository, never()).save(any());
    }

    // ---- updatePrescription ----

    @Test
    @DisplayName("updatePrescription - success")
    void updatePrescription_success() {
        PrescriptionDto updateDto = PrescriptionDto.builder()
                .diagnosis("Updated diagnosis")
                .medications("Updated medications")
                .instructions("Updated instructions")
                .notes("Updated notes")
                .build();

        Prescription updated = Prescription.builder()
                .id(PRESCRIPTION_ID)
                .appointmentId(APPOINTMENT_ID)
                .doctorId(DOCTOR_ID)
                .patientId(PATIENT_ID)
                .diagnosis("Updated diagnosis")
                .medications("Updated medications")
                .instructions("Updated instructions")
                .notes("Updated notes")
                .build();

        when(doctorRepository.findByUserId(USER_ID)).thenReturn(Optional.of(doctor));
        when(prescriptionRepository.findById(PRESCRIPTION_ID)).thenReturn(Optional.of(prescription));
        when(prescriptionRepository.save(any(Prescription.class))).thenReturn(updated);

        PrescriptionDto result = prescriptionService.updatePrescription(USER_ID, PRESCRIPTION_ID, updateDto);

        assertEquals("Updated diagnosis", result.getDiagnosis());
        assertEquals("Updated medications", result.getMedications());
        verify(prescriptionRepository).save(any(Prescription.class));
    }

    @Test
    @DisplayName("updatePrescription - wrong doctor throws exception")
    void updatePrescription_wrongDoctor_throwsException() {
        Doctor otherDoctor = Doctor.builder().id(999L).userId(2L).build();
        PrescriptionDto updateDto = PrescriptionDto.builder().build();

        when(doctorRepository.findByUserId(2L)).thenReturn(Optional.of(otherDoctor));
        when(prescriptionRepository.findById(PRESCRIPTION_ID)).thenReturn(Optional.of(prescription));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> prescriptionService.updatePrescription(2L, PRESCRIPTION_ID, updateDto));

        assertTrue(ex.getMessage().contains("your own prescriptions"));
        verify(prescriptionRepository, never()).save(any());
    }
}
