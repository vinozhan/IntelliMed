package com.intellimed.doctor.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@Slf4j
public class AppointmentServiceClientFallback implements AppointmentServiceClient {

    @Override
    public Map<String, Object> getAppointmentById(Long id) {
        throw new RuntimeException("Appointment service unavailable");
    }
}
