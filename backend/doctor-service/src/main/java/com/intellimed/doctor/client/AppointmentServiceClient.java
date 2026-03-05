package com.intellimed.doctor.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

@FeignClient(name = "appointment-service", fallback = AppointmentServiceClientFallback.class)
public interface AppointmentServiceClient {

    @GetMapping("/api/appointments/{id}")
    Map<String, Object> getAppointmentById(@PathVariable("id") Long id);
}
