package com.intellimed.ai.controller;

import com.intellimed.ai.dto.SymptomCheckRequest;
import com.intellimed.ai.dto.SymptomCheckResponse;
import com.intellimed.ai.service.AiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping("/symptom-check")
    public ResponseEntity<SymptomCheckResponse> checkSymptoms(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody SymptomCheckRequest request) {
        return ResponseEntity.ok(aiService.checkSymptoms(userId, request));
    }

    @GetMapping("/symptom-check/history")
    public ResponseEntity<List<SymptomCheckResponse>> getHistory(
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(aiService.getHistory(userId));
    }
}
