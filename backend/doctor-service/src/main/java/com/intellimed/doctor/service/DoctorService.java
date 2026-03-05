package com.intellimed.doctor.service;

import com.intellimed.doctor.dto.*;
import com.intellimed.doctor.entity.Doctor;
import com.intellimed.doctor.exception.ResourceNotFoundException;
import com.intellimed.doctor.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;

    public DoctorDto createDoctor(Long userId, String firstName, String lastName, DoctorCreateRequest request) {
        if (doctorRepository.findByUserId(userId).isPresent()) {
            throw new RuntimeException("Doctor profile already exists");
        }

        Doctor doctor = Doctor.builder()
                .userId(userId)
                .firstName(firstName)
                .lastName(lastName)
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
            doctors = doctorRepository.findBySpecialtyContainingIgnoreCaseAndIsVerifiedTrue(specialty);
        } else if (name != null && !name.isEmpty()) {
            doctors = doctorRepository.findByIsVerifiedTrueAndFirstNameContainingIgnoreCaseOrIsVerifiedTrueAndLastNameContainingIgnoreCase(name, name);
        } else {
            doctors = doctorRepository.findByIsVerifiedTrue();
        }
        return doctors.stream().map(this::toDto).collect(Collectors.toList());
    }

    public Page<DoctorDto> searchDoctors(String specialty, String name, int page, int size) {
        PageRequest pageable = PageRequest.of(page, size);
        Page<Doctor> doctors;
        if (specialty != null && !specialty.isEmpty()) {
            doctors = doctorRepository.findBySpecialtyContainingIgnoreCaseAndIsVerifiedTrue(specialty, pageable);
        } else if (name != null && !name.isEmpty()) {
            doctors = doctorRepository.findByIsVerifiedTrueAndFirstNameContainingIgnoreCaseOrIsVerifiedTrueAndLastNameContainingIgnoreCase(name, name, pageable);
        } else {
            doctors = doctorRepository.findByIsVerifiedTrue(pageable);
        }
        return doctors.map(this::toDto);
    }

    public Map<String, Object> getStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalDoctors", doctorRepository.count());
        stats.put("verifiedCount", doctorRepository.countByIsVerifiedTrue());
        stats.put("unverifiedCount", doctorRepository.countByIsVerifiedFalse());
        return stats;
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
                .firstName(doctor.getFirstName())
                .lastName(doctor.getLastName())
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
