package com.intellimed.appointment.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;

@FeignClient(name = "doctor-service", fallback = DoctorServiceClientFallback.class)
public interface DoctorServiceClient {

    @GetMapping("/api/doctors/{id}")
    Map<String, Object> getDoctorById(@PathVariable("id") Long id);

    @GetMapping("/api/doctors/by-user/{userId}")
    Map<String, Object> getDoctorByUserId(@PathVariable("userId") Long userId);

    @GetMapping("/api/doctors/{id}/availability")
    List<Map<String, Object>> getAvailability(@PathVariable("id") Long id,
                                               @RequestParam(value = "date", required = false) String date);

    @GetMapping("/api/doctors/{doctorId}/availability/slot")
    Map<String, Object> findSlot(@PathVariable("doctorId") Long doctorId,
                                  @RequestParam("date") String date,
                                  @RequestParam("startTime") String startTime);

    @PutMapping("/api/doctors/availability/{slotId}/consume")
    Map<String, Object> consumeSlot(@PathVariable("slotId") Long slotId);

    @PutMapping("/api/doctors/availability/{slotId}/release")
    Map<String, Object> releaseSlot(@PathVariable("slotId") Long slotId);
}
