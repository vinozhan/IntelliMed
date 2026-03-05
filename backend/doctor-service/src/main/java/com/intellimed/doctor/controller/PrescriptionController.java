package com.intellimed.doctor.controller;

import com.intellimed.doctor.dto.PrescriptionDto;
import com.intellimed.doctor.service.PrescriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    @GetMapping("/{patientId}/prescriptions")
    public ResponseEntity<List<PrescriptionDto>> getPatientPrescriptions(
            @PathVariable Long patientId,
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("X-User-Role") String role) {
        if (!userId.equals(patientId) && !"DOCTOR".equals(role) && !"ADMIN".equals(role)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(prescriptionService.getPrescriptionsByPatient(patientId));
    }
}
