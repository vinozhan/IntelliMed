package com.intellimed.appointment.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
@Slf4j
public class DoctorServiceClientFallback implements DoctorServiceClient {

    @Override
    public Map<String, Object> getDoctorById(Long id) {
        throw new RuntimeException("Doctor service unavailable");
    }

    @Override
    public Map<String, Object> getDoctorByUserId(Long userId) {
        throw new RuntimeException("Doctor service unavailable");
    }

    @Override
    public List<Map<String, Object>> getAvailability(Long id, String date) {
        log.warn("Doctor service unavailable — returning empty availability");
        return List.of();
    }

    @Override
    public Map<String, Object> findSlot(Long doctorId, String date, String startTime) {
        log.warn("Doctor service unavailable — slot lookup skipped");
        return null;
    }

    @Override
    public Map<String, Object> consumeSlot(Long slotId) {
        log.warn("Doctor service unavailable — slot consumption skipped for slotId: {}", slotId);
        return null;
    }

    @Override
    public Map<String, Object> releaseSlot(Long slotId) {
        log.warn("Doctor service unavailable — slot release skipped for slotId: {}", slotId);
        return null;
    }
}
