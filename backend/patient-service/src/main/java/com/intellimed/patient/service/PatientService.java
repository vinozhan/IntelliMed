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

import org.springframework.beans.factory.annotation.Value;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final MedicalReportRepository reportRepository;

    @Value("${app.upload-dir:uploads/reports/}")
    private String uploadDir;

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "application/pdf", "image/jpeg", "image/png", "image/gif"
    );
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

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

        // Validate file size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum allowed size of 10MB");
        }

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("File type not allowed. Accepted types: PDF, JPEG, PNG, GIF");
        }

        // Sanitize filename: remove path traversal characters, keep only safe characters
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) originalFilename = "unknown";
        String sanitizedName = originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");

        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String fileName = UUID.randomUUID() + "_" + sanitizedName;
        Path filePath = uploadPath.resolve(fileName).normalize();

        // Ensure resolved path is still within upload directory
        if (!filePath.startsWith(uploadPath.toAbsolutePath().normalize())) {
            throw new IllegalArgumentException("Invalid file path");
        }

        Files.copy(file.getInputStream(), filePath);

        MedicalReport report = MedicalReport.builder()
                .patientId(patient.getId())
                .fileName(sanitizedName)
                .fileUrl("/uploads/reports/" + fileName)
                .fileType(contentType)
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
