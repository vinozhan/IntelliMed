package com.intellimed.doctor.service;

import com.intellimed.doctor.dto.PrescriptionDto;
import com.intellimed.doctor.entity.Doctor;
import com.intellimed.doctor.entity.Prescription;
import com.intellimed.doctor.exception.ResourceNotFoundException;
import com.intellimed.doctor.repository.DoctorRepository;
import com.intellimed.doctor.repository.PrescriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final DoctorRepository doctorRepository;

    public PrescriptionDto createPrescription(Long userId, PrescriptionDto dto) {
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

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
