package com.intellimed.doctor.service;

import com.intellimed.doctor.client.AppointmentServiceClient;
import com.intellimed.doctor.dto.PrescriptionDto;
import com.intellimed.doctor.entity.Doctor;
import com.intellimed.doctor.entity.Prescription;
import com.intellimed.doctor.exception.ResourceNotFoundException;
import com.intellimed.doctor.repository.DoctorRepository;
import com.intellimed.doctor.repository.PrescriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentServiceClient appointmentServiceClient;

    public PrescriptionDto createPrescription(Long userId, PrescriptionDto dto) {
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        // Validate appointment status and doctor ownership
        Map<String, Object> appointment = appointmentServiceClient.getAppointmentById(dto.getAppointmentId());
        String status = (String) appointment.get("status");
        if (!"CONFIRMED".equals(status) && !"COMPLETED".equals(status)) {
            throw new IllegalArgumentException("Prescription can only be created for CONFIRMED or COMPLETED appointments");
        }
        Long appointmentDoctorId = ((Number) appointment.get("doctorId")).longValue();
        if (!appointmentDoctorId.equals(doctor.getId())) {
            throw new IllegalArgumentException("You can only create prescriptions for your own appointments");
        }

        Prescription prescription = Prescription.builder()
                .appointmentId(dto.getAppointmentId())
                .doctorId(doctor.getId())
                .patientId(dto.getPatientId())
                .diagnosis(dto.getDiagnosis())
                .medications(dto.getMedications())
                .instructions(dto.getInstructions())
                .notes(dto.getNotes())
                .build();

        prescription = prescriptionRepository.save(prescription);
        return toDto(prescription);
    }

    public List<PrescriptionDto> getPrescriptionsByPatient(Long patientId) {
        return prescriptionRepository.findByPatientIdOrderByIssuedAtDesc(patientId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public Page<PrescriptionDto> getPrescriptionsByPatient(Long patientId, int page, int size) {
        return prescriptionRepository.findByPatientIdOrderByIssuedAtDesc(patientId, PageRequest.of(page, size))
                .map(this::toDto);
    }

    @org.springframework.transaction.annotation.Transactional
    public PrescriptionDto updatePrescription(Long userId, Long prescriptionId, PrescriptionDto dto) {
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found"));

        if (!prescription.getDoctorId().equals(doctor.getId())) {
            throw new IllegalArgumentException("You can only update your own prescriptions");
        }

        prescription.setDiagnosis(dto.getDiagnosis());
        prescription.setMedications(dto.getMedications());
        prescription.setInstructions(dto.getInstructions());
        prescription.setNotes(dto.getNotes());

        prescription = prescriptionRepository.save(prescription);
        return toDto(prescription);
    }

    public List<PrescriptionDto> getPrescriptionsByDoctor(Long userId) {
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
        return prescriptionRepository.findByDoctorIdOrderByIssuedAtDesc(doctor.getId())
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public Page<PrescriptionDto> getPrescriptionsByDoctor(Long userId, int page, int size) {
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
        return prescriptionRepository.findByDoctorIdOrderByIssuedAtDesc(doctor.getId(), PageRequest.of(page, size))
                .map(this::toDto);
    }

    private PrescriptionDto toDto(Prescription p) {
        return PrescriptionDto.builder()
                .id(p.getId())
                .appointmentId(p.getAppointmentId())
                .doctorId(p.getDoctorId())
                .patientId(p.getPatientId())
                .diagnosis(p.getDiagnosis())
                .medications(p.getMedications())
                .instructions(p.getInstructions())
                .notes(p.getNotes())
                .build();
    }
}
