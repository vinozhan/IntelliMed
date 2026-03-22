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
import java.util.List;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final MedicalReportRepository reportRepository;
    private final S3Service s3Service;

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

    public PatientProfileDto uploadProfilePicture(Long userId, MultipartFile file) throws IOException {
        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));

        s3Service.deleteFile(patient.getProfileImageUrl());

        String url = s3Service.uploadFile(file, "profiles");
        patient.setProfileImageUrl(url);
        patientRepository.save(patient);

        return getProfile(userId);
    }

    public MedicalReport uploadReport(Long userId, MultipartFile file, String description) throws IOException {
        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));

        String url = s3Service.uploadFile(file, "reports");

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) originalFilename = "unknown";
        String sanitizedName = originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");

        MedicalReport report = MedicalReport.builder()
                .patientId(patient.getId())
                .fileName(sanitizedName)
                .fileUrl(url)
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
