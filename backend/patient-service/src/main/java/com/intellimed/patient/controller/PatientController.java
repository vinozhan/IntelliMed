package com.intellimed.patient.controller;

import com.intellimed.patient.dto.PatientProfileDto;
import com.intellimed.patient.entity.MedicalReport;
import com.intellimed.patient.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @GetMapping("/profile")
    public ResponseEntity<PatientProfileDto> getProfile(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(patientService.getProfile(userId));
    }

    @PutMapping("/profile")
    public ResponseEntity<PatientProfileDto> updateProfile(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody PatientProfileDto dto) {
        return ResponseEntity.ok(patientService.updateProfile(userId, dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PatientProfileDto> getPatientById(@PathVariable Long id) {
        return ResponseEntity.ok(patientService.getPatientById(id));
    }

    @PostMapping("/reports")
    public ResponseEntity<MedicalReport> uploadReport(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "description", required = false) String description) throws IOException {
        return ResponseEntity.ok(patientService.uploadReport(userId, file, description));
    }

    @GetMapping("/reports")
    public ResponseEntity<List<MedicalReport>> getReports(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(patientService.getReports(userId));
    }

    @GetMapping("/{patientId}/reports")
    public ResponseEntity<List<MedicalReport>> getReportsByPatientId(@PathVariable Long patientId) {
        return ResponseEntity.ok(patientService.getReportsByPatientId(patientId));
    }
}
