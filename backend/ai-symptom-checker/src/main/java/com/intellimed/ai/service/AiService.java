package com.intellimed.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.intellimed.ai.dto.SymptomCheckRequest;
import com.intellimed.ai.dto.SymptomCheckResponse;
import com.intellimed.ai.entity.SymptomCheckLog;
import com.intellimed.ai.repository.SymptomCheckLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiService {

    private final WebClient webClient;
    private final SymptomCheckLogRepository logRepository;
    private final ObjectMapper objectMapper;

    @Value("${ai.openai.api-key}")
    private String apiKey;

    @Value("${ai.openai.model}")
    private String model;

    @Value("${ai.openai.api-url}")
    private String apiUrl;

    private static final String SYSTEM_PROMPT = """
            You are a medical symptom analysis AI assistant. Analyze the patient's symptoms and respond ONLY with a valid JSON object in this exact format:
            {
                "possibleConditions": ["condition1", "condition2", "condition3"],
                "recommendedSpecialty": "Medical Specialty Name",
                "severityLevel": "LOW|MEDIUM|HIGH|CRITICAL",
                "advice": "Brief medical advice and next steps"
            }
            Be conservative in your assessments. Always recommend seeing a doctor for proper diagnosis.
            """;

    public SymptomCheckResponse checkSymptoms(Long patientId, SymptomCheckRequest request) {
        String userMessage = String.format(
                "Patient symptoms: %s. Age: %s. Gender: %s.",
                request.getSymptoms(),
                request.getAge() != null ? request.getAge() : "not specified",
                request.getGender() != null ? request.getGender() : "not specified"
        );

        String aiResponseText;
        try {
            Map<String, Object> requestBody = Map.of(
                    "model", model,
                    "messages", List.of(
                            Map.of("role", "system", "content", SYSTEM_PROMPT),
                            Map.of("role", "user", "content", userMessage)
                    ),
                    "temperature", 0.3
            );

            String response = webClient.post()
                    .uri(apiUrl)
                    .header("Authorization", "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode responseNode = objectMapper.readTree(response);
            aiResponseText = responseNode.path("choices").get(0).path("message").path("content").asText();
        } catch (Exception e) {
            log.error("AI API call failed: {}", e.getMessage());
            // Fallback response
            aiResponseText = """
                    {"possibleConditions":["Unable to analyze - please consult a doctor"],"recommendedSpecialty":"General Practice","severityLevel":"MEDIUM","advice":"We were unable to process your symptoms automatically. Please consult a healthcare professional for proper evaluation."}
                    """;
        }

        // Parse AI response
        List<String> conditions = new ArrayList<>();
        String specialty = "General Practice";
        String severity = "MEDIUM";
        String advice = "Please consult a healthcare professional.";

        try {
            JsonNode aiJson = objectMapper.readTree(aiResponseText);
            if (aiJson.has("possibleConditions")) {
                conditions = new ArrayList<>();
                for (JsonNode c : aiJson.get("possibleConditions")) {
                    conditions.add(c.asText());
                }
            }
            specialty = aiJson.path("recommendedSpecialty").asText("General Practice");
            severity = aiJson.path("severityLevel").asText("MEDIUM");
            advice = aiJson.path("advice").asText("Please consult a healthcare professional.");
        } catch (Exception e) {
            log.warn("Failed to parse AI response: {}", e.getMessage());
        }

        // Save log
        SymptomCheckLog checkLog = SymptomCheckLog.builder()
                .patientId(patientId)
                .symptoms(request.getSymptoms())
                .aiResponse(aiResponseText)
                .recommendedSpecialty(specialty)
                .severityLevel(severity)
                .build();
        checkLog = logRepository.save(checkLog);

        return SymptomCheckResponse.builder()
                .id(checkLog.getId())
                .symptoms(request.getSymptoms())
                .possibleConditions(conditions)
                .recommendedSpecialty(specialty)
                .severityLevel(severity)
                .advice(advice)
                .disclaimer("DISCLAIMER: This is an AI-generated analysis and NOT a medical diagnosis. Always consult a qualified healthcare professional for proper medical advice.")
                .createdAt(checkLog.getCreatedAt().toString())
                .build();
    }

    public List<SymptomCheckResponse> getHistory(Long patientId) {
        return logRepository.findByPatientIdOrderByCreatedAtDesc(patientId).stream()
                .map(log -> {
                    List<String> conditions = new ArrayList<>();
                    String advice = "";
                    try {
                        JsonNode aiJson = objectMapper.readTree(log.getAiResponse());
                        if (aiJson.has("possibleConditions")) {
                            for (JsonNode c : aiJson.get("possibleConditions")) {
                                conditions.add(c.asText());
                            }
                        }
                        advice = aiJson.path("advice").asText("");
                    } catch (Exception ignored) {}

                    return SymptomCheckResponse.builder()
                            .id(log.getId())
                            .symptoms(log.getSymptoms())
                            .possibleConditions(conditions)
                            .recommendedSpecialty(log.getRecommendedSpecialty())
                            .severityLevel(log.getSeverityLevel())
                            .advice(advice)
                            .disclaimer("DISCLAIMER: This is an AI-generated analysis and NOT a medical diagnosis.")
                            .createdAt(log.getCreatedAt().toString())
                            .build();
                })
                .collect(Collectors.toList());
    }
}
