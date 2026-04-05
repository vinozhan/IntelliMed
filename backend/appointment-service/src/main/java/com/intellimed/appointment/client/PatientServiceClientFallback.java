package com.intellimed.appointment.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.openfeign.FallbackFactory;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@Slf4j
public class PatientServiceClientFallback implements FallbackFactory<PatientServiceClient> {

    @Override
    public PatientServiceClient create(Throwable cause) {
        return new PatientServiceClient() {
            @Override
            public Map<String, Object> getPatientById(Long id) {
                log.error("Patient service call failed for id {}: {}", id, cause.getMessage(), cause);
                throw new RuntimeException("Patient service unavailable");
            }
        };
    }
}
