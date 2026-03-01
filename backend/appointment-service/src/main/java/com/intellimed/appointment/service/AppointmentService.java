package com.intellimed.appointment.service;

import com.intellimed.appointment.client.DoctorServiceClient;
import com.intellimed.appointment.client.NotificationServiceClient;
import com.intellimed.appointment.dto.AppointmentCreateRequest;
import com.intellimed.appointment.dto.AppointmentDto;
import com.intellimed.appointment.entity.Appointment;
import com.intellimed.appointment.enums.AppointmentStatus;
import com.intellimed.appointment.exception.ResourceNotFoundException;
import com.intellimed.appointment.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

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

    public AppointmentDto createAppointment(Long patientId, AppointmentCreateRequest request) {
        // Validate doctor exists
        try {
            doctorServiceClient.getDoctorById(request.getDoctorId());
        } catch (Exception e) {
            throw new RuntimeException("Doctor not found or unavailable");
        }

        Appointment appointment = Appointment.builder()
                .patientId(patientId)
                .doctorId(request.getDoctorId())
                .appointmentDate(request.getAppointmentDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .reason(request.getReason())
                .status(AppointmentStatus.PENDING)
                .build();

        appointment = appointmentRepository.save(appointment);

        // Try to send notification
        try {
            notificationServiceClient.sendNotification(Map.of(
                    "type", "APPOINTMENT_BOOKED",
                    "appointmentId", appointment.getId(),
                    "patientId", patientId,
                    "doctorId", request.getDoctorId()
            ));
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

    public List<AppointmentDto> getDoctorAppointments(Long doctorId) {
        return appointmentRepository.findByDoctorIdOrderByAppointmentDateDesc(doctorId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public AppointmentDto updateAppointment(Long id, AppointmentDto dto) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (dto.getAppointmentDate() != null) appointment.setAppointmentDate(dto.getAppointmentDate());
        if (dto.getStartTime() != null) appointment.setStartTime(dto.getStartTime());
        if (dto.getEndTime() != null) appointment.setEndTime(dto.getEndTime());
        if (dto.getReason() != null) appointment.setReason(dto.getReason());
        if (dto.getNotes() != null) appointment.setNotes(dto.getNotes());

        appointment = appointmentRepository.save(appointment);
        return toDto(appointment);
    }

    public AppointmentDto cancelAppointment(Long id, String reason) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setCancellationReason(reason);
        appointment = appointmentRepository.save(appointment);
        return toDto(appointment);
    }

    public AppointmentDto confirmAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        appointment = appointmentRepository.save(appointment);
        return toDto(appointment);
    }

    public AppointmentDto completeAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointment = appointmentRepository.save(appointment);
        return toDto(appointment);
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
