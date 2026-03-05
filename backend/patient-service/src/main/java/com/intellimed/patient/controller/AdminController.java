package com.intellimed.patient.controller;

import com.intellimed.patient.dto.UserDto;
import com.intellimed.patient.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(
            @RequestHeader("X-User-Role") String role,
            @RequestParam(required = false) Integer page,
            @RequestParam(defaultValue = "20") int size) {
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).build();
        }
        if (page != null) {
            return ResponseEntity.ok(adminService.getAllUsers(page, size));
        }
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats(@RequestHeader("X-User-Role") String role) {
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(adminService.getStats());
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<UserDto> updateUserStatus(
            @RequestHeader("X-User-Role") String role,
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(adminService.updateUserStatus(id, body.get("isActive")));
    }
}
