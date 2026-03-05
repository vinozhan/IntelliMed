package com.intellimed.doctor.controller;

import com.intellimed.doctor.dto.*;
import com.intellimed.doctor.service.AvailabilityService;
import com.intellimed.doctor.service.DoctorService;
import com.intellimed.doctor.service.PrescriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;
    private final AvailabilityService availabilityService;
    private final PrescriptionService prescriptionService;

    @PostMapping
    public ResponseEntity<DoctorDto> createDoctor(
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader(value = "X-User-FirstName", required = false) String firstName,
            @RequestHeader(value = "X-User-LastName", required = false) String lastName,
            @Valid @RequestBody DoctorCreateRequest request) {
        return ResponseEntity.ok(doctorService.createDoctor(userId, firstName, lastName, request));
    }

    @GetMapping("/profile")
    public ResponseEntity<DoctorDto> getProfile(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(doctorService.getProfile(userId));
    }

    @PutMapping("/profile")
    public ResponseEntity<DoctorDto> updateProfile(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody DoctorCreateRequest request) {
        return ResponseEntity.ok(doctorService.updateProfile(userId, request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DoctorDto> getDoctorById(@PathVariable Long id) {
        return ResponseEntity.ok(doctorService.getDoctorById(id));
    }

    @GetMapping("/by-user/{userId}")
    public ResponseEntity<DoctorDto> getDoctorByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(doctorService.getProfile(userId));
    }

    @GetMapping
    public ResponseEntity<List<DoctorDto>> searchDoctors(
            @RequestParam(required = false) String specialty,
            @RequestParam(required = false) String name) {
        return ResponseEntity.ok(doctorService.searchDoctors(specialty, name));
    }

    @GetMapping("/specialties")
    public ResponseEntity<List<String>> getSpecialties() {
        return ResponseEntity.ok(doctorService.getSpecialties());
    }

    // Availability endpoints
    @PostMapping("/availability")
    public ResponseEntity<List<AvailabilitySlotDto>> createSlot(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody AvailabilitySlotDto dto) {
        return ResponseEntity.ok(availabilityService.createSlot(userId, dto));
    }

    @PutMapping("/availability/{slotId}")
    public ResponseEntity<AvailabilitySlotDto> updateSlot(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long slotId,
            @RequestBody AvailabilitySlotDto dto) {
        return ResponseEntity.ok(availabilityService.updateSlot(userId, slotId, dto));
    }

    @DeleteMapping("/availability/{slotId}")
    public ResponseEntity<Void> deleteSlot(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long slotId) {
        availabilityService.deleteSlot(userId, slotId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/availability")
    public ResponseEntity<List<AvailabilitySlotDto>> getAvailability(
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(availabilityService.getAvailability(id, date));
    }

    // Prescription endpoints
    @PostMapping("/prescriptions")
    public ResponseEntity<PrescriptionDto> createPrescription(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody PrescriptionDto dto) {
        return ResponseEntity.ok(prescriptionService.createPrescription(userId, dto));
    }

    @PutMapping("/prescriptions/{id}")
    public ResponseEntity<PrescriptionDto> updatePrescription(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long id,
            @RequestBody PrescriptionDto dto) {
        return ResponseEntity.ok(prescriptionService.updatePrescription(userId, id, dto));
    }

    @GetMapping("/prescriptions")
    public ResponseEntity<List<PrescriptionDto>> getDoctorPrescriptions(
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(prescriptionService.getPrescriptionsByDoctor(userId));
    }

    @GetMapping("/patients/{patientId}/prescriptions")
    public ResponseEntity<List<PrescriptionDto>> getPatientPrescriptions(
            @PathVariable Long patientId) {
        return ResponseEntity.ok(prescriptionService.getPrescriptionsByPatient(patientId));
    }

    // Admin endpoints
    @GetMapping("/unverified")
    public ResponseEntity<List<DoctorDto>> getUnverifiedDoctors(@RequestHeader("X-User-Role") String role) {
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(doctorService.getUnverifiedDoctors());
    }

    @PutMapping("/{id}/verify")
    public ResponseEntity<DoctorDto> verifyDoctor(
            @PathVariable Long id,
            @RequestHeader("X-User-Role") String role) {
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(doctorService.verifyDoctor(id));
    }
}
