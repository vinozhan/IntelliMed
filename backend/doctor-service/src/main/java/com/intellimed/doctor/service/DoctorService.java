package com.intellimed.doctor.service;

import com.intellimed.doctor.dto.*;
import com.intellimed.doctor.entity.Doctor;
import com.intellimed.doctor.exception.ResourceNotFoundException;
import com.intellimed.doctor.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;

    public DoctorDto createDoctor(Long userId, DoctorCreateRequest request) {
        if (doctorRepository.findByUserId(userId).isPresent()) {
            throw new RuntimeException("Doctor profile already exists");
        }

        Doctor doctor = Doctor.builder()
                .userId(userId)
                .specialty(request.getSpecialty())
                .qualification(request.getQualification())
                .experienceYears(request.getExperienceYears())
                .consultationFee(request.getConsultationFee())
                .hospital(request.getHospital())
                .build();

        doctor = doctorRepository.save(doctor);
        return toDto(doctor);
    }

    public DoctorDto getProfile(Long userId) {
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));
        return toDto(doctor);
    }

    public DoctorDto updateProfile(Long userId, DoctorCreateRequest request) {
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));

        doctor.setSpecialty(request.getSpecialty());
        doctor.setQualification(request.getQualification());
        doctor.setExperienceYears(request.getExperienceYears());
        doctor.setConsultationFee(request.getConsultationFee());
        doctor.setHospital(request.getHospital());

        doctor = doctorRepository.save(doctor);
        return toDto(doctor);
    }

    public DoctorDto getDoctorById(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
        return toDto(doctor);
    }

    public List<DoctorDto> searchDoctors(String specialty, String name) {
        List<Doctor> doctors;
        if (specialty != null && !specialty.isEmpty()) {
            doctors = doctorRepository.findBySpecialtyContainingIgnoreCase(specialty);
        } else {
            doctors = doctorRepository.findByIsVerifiedTrue();
        }
        return doctors.stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<String> getSpecialties() {
        return Arrays.asList(
            "General Practice", "Cardiology", "Dermatology", "Endocrinology",
            "Gastroenterology", "Neurology", "Oncology", "Ophthalmology",
            "Orthopedics", "Pediatrics", "Psychiatry", "Pulmonology",
            "Radiology", "Surgery", "Urology"
        );
    }

    public List<DoctorDto> getUnverifiedDoctors() {
        return doctorRepository.findByIsVerifiedFalse().stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    public DoctorDto verifyDoctor(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
        doctor.setIsVerified(true);
        doctor = doctorRepository.save(doctor);
        return toDto(doctor);
    }

    private DoctorDto toDto(Doctor doctor) {
        return DoctorDto.builder()
                .id(doctor.getId())
                .userId(doctor.getUserId())
                .specialty(doctor.getSpecialty())
                .qualification(doctor.getQualification())
                .experienceYears(doctor.getExperienceYears())
                .consultationFee(doctor.getConsultationFee())
                .hospital(doctor.getHospital())
                .isVerified(doctor.getIsVerified())
                .rating(doctor.getRating())
                .build();
    }
}
