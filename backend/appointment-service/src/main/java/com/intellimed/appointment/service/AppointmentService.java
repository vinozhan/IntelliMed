package com.intellimed.appointment.service;

import com.intellimed.appointment.client.DoctorServiceClient;
import com.intellimed.appointment.client.NotificationServiceClient;
import com.intellimed.appointment.client.PatientServiceClient;
import com.intellimed.appointment.dto.AppointmentCreateRequest;
import com.intellimed.appointment.dto.AppointmentDto;
import com.intellimed.appointment.dto.SendNotificationRequest;
import com.intellimed.appointment.entity.Appointment;
import com.intellimed.appointment.enums.AppointmentStatus;
import com.intellimed.appointment.exception.ResourceNotFoundException;
import com.intellimed.appointment.exception.UnauthorizedException;
import com.intellimed.appointment.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorServiceClient doctorServiceClient;
    private final NotificationServiceClient notificationServiceClient;
    private final PatientServiceClient patientServiceClient;

    @Transactional
    public AppointmentDto createAppointment(Long patientId, AppointmentCreateRequest request) {
        // Validate doctor exists and get userId
        Map<String, Object> doctor;
        try {
            doctor = doctorServiceClient.getDoctorById(request.getDoctorId());
        } catch (Exception e) {
            throw new RuntimeException("Doctor not found or unavailable");
        }
        Long doctorUserId = ((Number) doctor.get("userId")).longValue();

        // Default endTime to startTime + 30 min if not provided
        LocalTime endTime = request.getEndTime() != null
                ? request.getEndTime()
                : request.getStartTime().plusMinutes(30);

        // Check for double-booking
        boolean hasOverlap = appointmentRepository.existsOverlappingAppointment(
                request.getDoctorId(),
                request.getAppointmentDate(),
                request.getStartTime(),
                endTime
        );
        if (hasOverlap) {
            throw new RuntimeException("This time slot is already booked for the selected doctor");
        }

        Appointment appointment = Appointment.builder()
                .patientId(patientId)
                .doctorId(request.getDoctorId())
                .doctorUserId(doctorUserId)
                .appointmentDate(request.getAppointmentDate())
                .startTime(request.getStartTime())
                .endTime(endTime)
                .reason(request.getReason())
                .status(AppointmentStatus.PENDING)
                .build();

        // Try to consume availability slot
        try {
            Map<String, Object> slot = doctorServiceClient.findSlot(
                    request.getDoctorId(),
                    request.getAppointmentDate().toString(),
                    request.getStartTime().toString());
            if (slot != null && slot.get("id") != null) {
                Long slotId = ((Number) slot.get("id")).longValue();
                Boolean isAvailable = (Boolean) slot.get("isAvailable");
                if (Boolean.FALSE.equals(isAvailable)) {
                    throw new RuntimeException("This time slot is no longer available");
                }
                doctorServiceClient.consumeSlot(slotId);
                appointment.setSlotId(slotId);
            }
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("no longer available")) {
                throw e;
            }
            log.warn("Slot consumption skipped: {}", e.getMessage());
        }

        appointment = appointmentRepository.save(appointment);

        // Send notification with proper payload
        try {
            Map<String, Object> patient = patientServiceClient.getPatientById(patientId);
            String patientEmail = (String) patient.get("email");
            String patientName = patient.get("firstName") + " " + patient.get("lastName");
            String doctorName = doctor.get("firstName") != null
                    ? doctor.get("firstName") + " " + doctor.get("lastName")
                    : "Dr. #" + request.getDoctorId();

            notificationServiceClient.sendNotification(SendNotificationRequest.builder()
                    .recipientEmail(patientEmail)
                    .type("APPOINTMENT_BOOKED")
                    .channel("EMAIL")
                    .subject("Appointment Booked Successfully")
                    .body(String.format("Dear %s, your appointment with %s on %s at %s has been booked successfully. Status: PENDING.",
                            patientName, doctorName, request.getAppointmentDate(), request.getStartTime()))
                    .build());
        } catch (Exception e) {
            log.warn("Failed to send notification: {}", e.getMessage());
        }

        return toDto(appointment);
    }

    public AppointmentDto getAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
        return toDto(appointment);
    }

    public List<AppointmentDto> getPatientAppointments(Long patientId) {
        return appointmentRepository.findByPatientIdOrderByAppointmentDateDesc(patientId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public Page<AppointmentDto> getPatientAppointments(Long patientId, int page, int size) {
        return appointmentRepository.findByPatientIdOrderByAppointmentDateDesc(patientId, PageRequest.of(page, size))
                .map(this::toDto);
    }

    public List<AppointmentDto> getDoctorAppointments(Long doctorUserId) {
        return appointmentRepository.findByDoctorUserIdOrderByAppointmentDateDesc(doctorUserId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public Page<AppointmentDto> getDoctorAppointments(Long doctorUserId, int page, int size) {
        return appointmentRepository.findByDoctorUserIdOrderByAppointmentDateDesc(doctorUserId, PageRequest.of(page, size))
                .map(this::toDto);
    }

    @Transactional
    public AppointmentDto updateAppointment(Long id, Long userId, String userRole, AppointmentDto dto) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        // Ownership check: only the patient who booked or the assigned doctor can update
        if (!"ADMIN".equals(userRole)) {
            if (!appointment.getPatientId().equals(userId) && !appointment.getDoctorUserId().equals(userId)) {
                throw new UnauthorizedException("You are not authorized to update this appointment");
            }
        }

        // Only PENDING appointments can be rescheduled
        if (appointment.getStatus() != AppointmentStatus.PENDING) {
            throw new RuntimeException("Only PENDING appointments can be rescheduled");
        }

        boolean timeChanged = (dto.getAppointmentDate() != null && !dto.getAppointmentDate().equals(appointment.getAppointmentDate()))
                || (dto.getStartTime() != null && !dto.getStartTime().equals(appointment.getStartTime()));

        // Release old slot and consume new one if time changed
        if (timeChanged) {
            if (appointment.getSlotId() != null) {
                try {
                    doctorServiceClient.releaseSlot(appointment.getSlotId());
                } catch (Exception e) {
                    log.warn("Failed to release old slot {}: {}", appointment.getSlotId(), e.getMessage());
                }
                appointment.setSlotId(null);
            }
        }

        if (dto.getAppointmentDate() != null) appointment.setAppointmentDate(dto.getAppointmentDate());
        if (dto.getStartTime() != null) appointment.setStartTime(dto.getStartTime());
        if (dto.getEndTime() != null) appointment.setEndTime(dto.getEndTime());
        if (dto.getReason() != null) appointment.setReason(dto.getReason());
        if (dto.getNotes() != null) appointment.setNotes(dto.getNotes());

        // Try to consume new slot if time changed
        if (timeChanged) {
            try {
                Map<String, Object> slot = doctorServiceClient.findSlot(
                        appointment.getDoctorId(),
                        appointment.getAppointmentDate().toString(),
                        appointment.getStartTime().toString());
                if (slot != null && slot.get("id") != null) {
                    Long slotId = ((Number) slot.get("id")).longValue();
                    Boolean isAvailable = (Boolean) slot.get("isAvailable");
                    if (Boolean.FALSE.equals(isAvailable)) {
                        throw new RuntimeException("The new time slot is no longer available");
                    }
                    doctorServiceClient.consumeSlot(slotId);
                    appointment.setSlotId(slotId);
                }
            } catch (RuntimeException e) {
                if (e.getMessage() != null && e.getMessage().contains("no longer available")) {
                    throw e;
                }
                log.warn("Slot consumption skipped during reschedule: {}", e.getMessage());
            }
        }

        appointment = appointmentRepository.save(appointment);
        return toDto(appointment);
    }

    @Transactional
    public AppointmentDto cancelAppointment(Long id, Long userId, String userRole, String reason) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        // Ownership check
        if (!"ADMIN".equals(userRole)) {
            if (!appointment.getPatientId().equals(userId) && !appointment.getDoctorUserId().equals(userId)) {
                throw new UnauthorizedException("You are not authorized to cancel this appointment");
            }
        }

        // Status validation: only PENDING or CONFIRMED can be cancelled
        if (appointment.getStatus() != AppointmentStatus.PENDING
                && appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new RuntimeException("Only PENDING or CONFIRMED appointments can be cancelled");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setCancellationReason(reason);

        // Release the slot if one was consumed
        if (appointment.getSlotId() != null) {
            try {
                doctorServiceClient.releaseSlot(appointment.getSlotId());
            } catch (Exception e) {
                log.warn("Failed to release slot {}: {}", appointment.getSlotId(), e.getMessage());
            }
        }

        appointment = appointmentRepository.save(appointment);
        return toDto(appointment);
    }

    @Transactional
    public AppointmentDto confirmAppointment(Long id, Long userId) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        // Only the assigned doctor can confirm
        if (!appointment.getDoctorUserId().equals(userId)) {
            throw new UnauthorizedException("Only the assigned doctor can confirm this appointment");
        }

        if (appointment.getStatus() != AppointmentStatus.PENDING) {
            throw new RuntimeException("Only PENDING appointments can be confirmed");
        }

        appointment.setStatus(AppointmentStatus.CONFIRMED);
        appointment = appointmentRepository.save(appointment);
        return toDto(appointment);
    }

    @Transactional
    public AppointmentDto rejectAppointment(Long id, Long userId, String reason) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        // Only the assigned doctor can reject
        if (!appointment.getDoctorUserId().equals(userId)) {
            throw new UnauthorizedException("Only the assigned doctor can reject this appointment");
        }

        if (appointment.getStatus() != AppointmentStatus.PENDING) {
            throw new RuntimeException("Only PENDING appointments can be rejected");
        }

        appointment.setStatus(AppointmentStatus.REJECTED);
        appointment.setCancellationReason(reason);

        // Release the slot if one was consumed
        if (appointment.getSlotId() != null) {
            try {
                doctorServiceClient.releaseSlot(appointment.getSlotId());
            } catch (Exception e) {
                log.warn("Failed to release slot {}: {}", appointment.getSlotId(), e.getMessage());
            }
        }

        appointment = appointmentRepository.save(appointment);
        return toDto(appointment);
    }

    @Transactional
    public AppointmentDto completeAppointment(Long id, Long userId) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        // Only the assigned doctor can complete
        if (!appointment.getDoctorUserId().equals(userId)) {
            throw new UnauthorizedException("Only the assigned doctor can complete this appointment");
        }

        if (appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new RuntimeException("Only CONFIRMED appointments can be completed");
        }

        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointment = appointmentRepository.save(appointment);
        return toDto(appointment);
    }

    public Map<String, Object> getStats() {
        Map<String, Object> stats = new java.util.LinkedHashMap<>();
        stats.put("totalAppointments", appointmentRepository.count());
        for (AppointmentStatus status : AppointmentStatus.values()) {
            stats.put(status.name().toLowerCase() + "Count", appointmentRepository.countByStatus(status));
        }
        return stats;
    }

    private AppointmentDto toDto(Appointment a) {
        return AppointmentDto.builder()
                .id(a.getId())
                .patientId(a.getPatientId())
                .doctorId(a.getDoctorId())
                .appointmentDate(a.getAppointmentDate())
                .startTime(a.getStartTime())
                .endTime(a.getEndTime())
                .status(a.getStatus().name())
                .reason(a.getReason())
                .notes(a.getNotes())
                .cancellationReason(a.getCancellationReason())
                .build();
    }
}
