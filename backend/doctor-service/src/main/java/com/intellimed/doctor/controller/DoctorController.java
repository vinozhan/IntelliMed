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
import java.time.LocalTime;
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
    public ResponseEntity<?> searchDoctors(
            @RequestParam(required = false) String specialty,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer page,
            @RequestParam(defaultValue = "20") int size) {
        if (page != null) {
            return ResponseEntity.ok(doctorService.searchDoctors(specialty, name, page, size));
        }
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

    @GetMapping("/{doctorId}/availability/slot")
    public ResponseEntity<AvailabilitySlotDto> findSlot(
            @PathVariable Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime startTime) {
        AvailabilitySlotDto slot = availabilityService.findSlot(doctorId, date, startTime);
        if (slot == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(slot);
    }

    @PutMapping("/availability/{slotId}/consume")
    public ResponseEntity<AvailabilitySlotDto> consumeSlot(@PathVariable Long slotId) {
        return ResponseEntity.ok(availabilityService.consumeSlot(slotId));
    }

    @PutMapping("/availability/{slotId}/release")
    public ResponseEntity<AvailabilitySlotDto> releaseSlot(@PathVariable Long slotId) {
        return ResponseEntity.ok(availabilityService.releaseSlot(slotId));
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
    public ResponseEntity<?> getDoctorPrescriptions(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam(required = false) Integer page,
            @RequestParam(defaultValue = "20") int size) {
        if (page != null) {
            return ResponseEntity.ok(prescriptionService.getPrescriptionsByDoctor(userId, page, size));
        }
        return ResponseEntity.ok(prescriptionService.getPrescriptionsByDoctor(userId));
    }

    @GetMapping("/patients/{patientId}/prescriptions")
    public ResponseEntity<?> getPatientPrescriptions(
            @PathVariable Long patientId,
            @RequestParam(required = false) Integer page,
            @RequestParam(defaultValue = "20") int size) {
        if (page != null) {
            return ResponseEntity.ok(prescriptionService.getPrescriptionsByPatient(patientId, page, size));
        }
        return ResponseEntity.ok(prescriptionService.getPrescriptionsByPatient(patientId));
    }

    // Admin endpoints
    @GetMapping("/stats")
    public ResponseEntity<?> getDoctorStats(@RequestHeader("X-User-Role") String role) {
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(doctorService.getStats());
    }

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
