package com.intellimed.patient.service;

import com.intellimed.patient.dto.PatientProfileDto;
import com.intellimed.patient.entity.MedicalReport;
import com.intellimed.patient.entity.Patient;
import com.intellimed.patient.entity.User;
import com.intellimed.patient.exception.ResourceNotFoundException;
import com.intellimed.patient.repository.MedicalReportRepository;
import com.intellimed.patient.repository.PatientRepository;
import com.intellimed.patient.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final MedicalReportRepository reportRepository;

    private final String uploadDir = "uploads/reports/";

    public PatientProfileDto getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));

        return PatientProfileDto.builder()
                .id(patient.getId())
                .userId(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .dateOfBirth(patient.getDateOfBirth())
                .gender(patient.getGender())
                .bloodType(patient.getBloodType())
                .address(patient.getAddress())
                .emergencyContact(patient.getEmergencyContact())
                .profileImageUrl(patient.getProfileImageUrl())
                .build();
    }

    public PatientProfileDto updateProfile(Long userId, PatientProfileDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));

        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setPhone(dto.getPhone());
        userRepository.save(user);

        patient.setDateOfBirth(dto.getDateOfBirth());
        patient.setGender(dto.getGender());
        patient.setBloodType(dto.getBloodType());
        patient.setAddress(dto.getAddress());
        patient.setEmergencyContact(dto.getEmergencyContact());
        patient.setProfileImageUrl(dto.getProfileImageUrl());
        patientRepository.save(patient);

        return getProfile(userId);
    }

    public PatientProfileDto getPatientById(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));
        return getProfile(patient.getUserId());
    }

    public MedicalReport uploadReport(Long userId, MultipartFile file, String description) throws IOException {
        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));

        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath);

        MedicalReport report = MedicalReport.builder()
                .patientId(patient.getId())
                .fileName(file.getOriginalFilename())
                .fileUrl("/uploads/reports/" + fileName)
                .fileType(file.getContentType())
                .description(description)
                .build();

        return reportRepository.save(report);
    }

    public List<MedicalReport> getReports(Long userId) {
        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));
        return reportRepository.findByPatientIdOrderByUploadedAtDesc(patient.getId());
    }

    public List<MedicalReport> getReportsByPatientId(Long patientId) {
        return reportRepository.findByPatientIdOrderByUploadedAtDesc(patientId);
    }
}
