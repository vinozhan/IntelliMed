package com.intellimed.appointment.controller;

import com.intellimed.appointment.dto.AppointmentCreateRequest;
import com.intellimed.appointment.dto.AppointmentDto;
import com.intellimed.appointment.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    public ResponseEntity<AppointmentDto> createAppointment(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody AppointmentCreateRequest request) {
        return ResponseEntity.ok(appointmentService.createAppointment(userId, request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppointmentDto> getAppointment(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.getAppointment(id));
    }

    @GetMapping("/patient")
    public ResponseEntity<?> getPatientAppointments(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam(required = false) Integer page,
            @RequestParam(defaultValue = "20") int size) {
        if (page != null) {
            return ResponseEntity.ok(appointmentService.getPatientAppointments(userId, page, size));
        }
        return ResponseEntity.ok(appointmentService.getPatientAppointments(userId));
    }

    @GetMapping("/doctor")
    public ResponseEntity<?> getDoctorAppointments(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam(required = false) Integer page,
            @RequestParam(defaultValue = "20") int size) {
        if (page != null) {
            return ResponseEntity.ok(appointmentService.getDoctorAppointments(userId, page, size));
        }
        return ResponseEntity.ok(appointmentService.getDoctorAppointments(userId));
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getAppointmentStats(@RequestHeader("X-User-Role") String role) {
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(appointmentService.getStats());
    }

    @PutMapping("/{id}")
    public ResponseEntity<AppointmentDto> updateAppointment(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader(value = "X-User-Role", defaultValue = "") String role,
            @RequestBody AppointmentDto dto) {
        return ResponseEntity.ok(appointmentService.updateAppointment(id, userId, role, dto));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<AppointmentDto> cancelAppointment(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader(value = "X-User-Role", defaultValue = "") String role,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(appointmentService.cancelAppointment(id, userId, role, body.get("reason")));
    }

    @PutMapping("/{id}/confirm")
    public ResponseEntity<AppointmentDto> confirmAppointment(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(appointmentService.confirmAppointment(id, userId));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<AppointmentDto> rejectAppointment(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(appointmentService.rejectAppointment(id, userId, body.get("reason")));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<AppointmentDto> completeAppointment(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(appointmentService.completeAppointment(id, userId));
    }
}
