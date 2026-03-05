package com.intellimed.telemedicine.controller;

import com.intellimed.telemedicine.dto.*;
import com.intellimed.telemedicine.service.TelemedicineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/telemedicine/sessions")
@RequiredArgsConstructor
public class TelemedicineController {

    private final TelemedicineService telemedicineService;

    @PostMapping
    public ResponseEntity<VideoSessionDto> createSession(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody CreateSessionRequest request) {
        return ResponseEntity.ok(telemedicineService.createSession(userId, request));
    }

    @GetMapping("/{appointmentId}")
    public ResponseEntity<VideoSessionDto> getSession(
            @PathVariable Long appointmentId,
            @RequestHeader("X-User-Id") Long userId) {
        VideoSessionDto session = telemedicineService.getSessionByAppointment(appointmentId);
        if (!userId.equals(session.getDoctorId()) && !userId.equals(session.getPatientId())) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(session);
    }

    @PutMapping("/{id}/start")
    public ResponseEntity<VideoSessionDto> startSession(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(telemedicineService.startSession(id));
    }

    @PutMapping("/{id}/end")
    public ResponseEntity<VideoSessionDto> endSession(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(telemedicineService.endSession(id));
    }

    @GetMapping("/{id}/join-info")
    public ResponseEntity<JoinInfoDto> getJoinInfo(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId) {
        JoinInfoDto joinInfo = telemedicineService.getJoinInfo(id);
        VideoSessionDto session = telemedicineService.getSessionById(id);
        if (!userId.equals(session.getDoctorId()) && !userId.equals(session.getPatientId())) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(joinInfo);
    }
}
