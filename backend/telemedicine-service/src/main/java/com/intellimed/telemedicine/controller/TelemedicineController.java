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
    public ResponseEntity<VideoSessionDto> getSession(@PathVariable Long appointmentId) {
        return ResponseEntity.ok(telemedicineService.getSessionByAppointment(appointmentId));
    }

    @PutMapping("/{id}/start")
    public ResponseEntity<VideoSessionDto> startSession(@PathVariable Long id) {
        return ResponseEntity.ok(telemedicineService.startSession(id));
    }

    @PutMapping("/{id}/end")
    public ResponseEntity<VideoSessionDto> endSession(@PathVariable Long id) {
        return ResponseEntity.ok(telemedicineService.endSession(id));
    }

    @GetMapping("/{id}/join-info")
    public ResponseEntity<JoinInfoDto> getJoinInfo(@PathVariable Long id) {
        return ResponseEntity.ok(telemedicineService.getJoinInfo(id));
    }
}
