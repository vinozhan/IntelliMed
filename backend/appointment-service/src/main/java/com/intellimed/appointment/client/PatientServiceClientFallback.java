package com.intellimed.appointment.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@Slf4j
public class PatientServiceClientFallback implements PatientServiceClient {

    @Override
    public Map<String, Object> getPatientById(Long id) {
        throw new RuntimeException("Patient service unavailable");
    }
}
