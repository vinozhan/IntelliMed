package com.intellimed.doctor.service;

import com.intellimed.doctor.dto.AvailabilitySlotDto;
import com.intellimed.doctor.entity.AvailabilitySlot;
import com.intellimed.doctor.entity.Doctor;
import com.intellimed.doctor.exception.ResourceNotFoundException;
import com.intellimed.doctor.repository.AvailabilitySlotRepository;
import com.intellimed.doctor.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AvailabilityService {

    private final AvailabilitySlotRepository slotRepository;
    private final DoctorRepository doctorRepository;

    public AvailabilitySlotDto createSlot(Long userId, AvailabilitySlotDto dto) {
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        AvailabilitySlot slot = AvailabilitySlot.builder()
                .doctorId(doctor.getId())
                .dayOfWeek(dto.getDayOfWeek())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .slotDate(dto.getSlotDate())
                .isAvailable(true)
                .maxPatients(dto.getMaxPatients() != null ? dto.getMaxPatients() : 1)
                .build();

        slot = slotRepository.save(slot);
        return toDto(slot);
    }

    public AvailabilitySlotDto updateSlot(Long userId, Long slotId, AvailabilitySlotDto dto) {
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        AvailabilitySlot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found"));

        if (!slot.getDoctorId().equals(doctor.getId())) {
            throw new RuntimeException("Not authorized to update this slot");
        }

        slot.setDayOfWeek(dto.getDayOfWeek());
        slot.setStartTime(dto.getStartTime());
        slot.setEndTime(dto.getEndTime());
        slot.setSlotDate(dto.getSlotDate());
        slot.setIsAvailable(dto.getIsAvailable());
        slot.setMaxPatients(dto.getMaxPatients());

        slot = slotRepository.save(slot);
        return toDto(slot);
    }

    public void deleteSlot(Long userId, Long slotId) {
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        AvailabilitySlot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found"));

        if (!slot.getDoctorId().equals(doctor.getId())) {
            throw new RuntimeException("Not authorized to delete this slot");
        }

        slotRepository.delete(slot);
    }

    public List<AvailabilitySlotDto> getAvailability(Long doctorId, LocalDate date) {
        List<AvailabilitySlot> slots;
        if (date != null) {
            slots = slotRepository.findByDoctorIdAndSlotDate(doctorId, date);
        } else {
            slots = slotRepository.findByDoctorIdAndIsAvailableTrue(doctorId);
        }
        return slots.stream().map(this::toDto).collect(Collectors.toList());
    }

    private AvailabilitySlotDto toDto(AvailabilitySlot slot) {
        return AvailabilitySlotDto.builder()
                .id(slot.getId())
                .doctorId(slot.getDoctorId())
                .dayOfWeek(slot.getDayOfWeek())
                .startTime(slot.getStartTime())
                .endTime(slot.getEndTime())
                .slotDate(slot.getSlotDate())
                .isAvailable(slot.getIsAvailable())
                .maxPatients(slot.getMaxPatients())
                .build();
    }
}
