package com.intellimed.doctor.service;

import com.intellimed.doctor.dto.AvailabilitySlotDto;
import com.intellimed.doctor.entity.AvailabilitySlot;
import com.intellimed.doctor.entity.Doctor;
import com.intellimed.doctor.exception.ResourceNotFoundException;
import com.intellimed.doctor.exception.UnauthorizedException;
import com.intellimed.doctor.repository.AvailabilitySlotRepository;
import com.intellimed.doctor.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AvailabilityService {

    private final AvailabilitySlotRepository slotRepository;
    private final DoctorRepository doctorRepository;

    @Transactional
    public List<AvailabilitySlotDto> createSlot(Long userId, AvailabilitySlotDto dto) {
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        String dayOfWeek = dto.getDayOfWeek();
        if (dayOfWeek == null && dto.getSlotDate() != null) {
            dayOfWeek = dto.getSlotDate().getDayOfWeek().name();
        }

        int duration = dto.getSlotDurationMinutes() != null ? dto.getSlotDurationMinutes() : 0;
        int maxPatients = dto.getMaxPatients() != null ? dto.getMaxPatients() : 1;

        List<AvailabilitySlot> savedSlots = new java.util.ArrayList<>();

        if (duration > 0) {
            LocalTime current = dto.getStartTime();
            while (current.plusMinutes(duration).compareTo(dto.getEndTime()) <= 0) {
                AvailabilitySlot slot = AvailabilitySlot.builder()
                        .doctorId(doctor.getId())
                        .dayOfWeek(dayOfWeek)
                        .startTime(current)
                        .endTime(current.plusMinutes(duration))
                        .slotDate(dto.getSlotDate())
                        .isAvailable(true)
                        .maxPatients(maxPatients)
                        .build();
                savedSlots.add(slotRepository.save(slot));
                current = current.plusMinutes(duration);
            }
        } else {
            AvailabilitySlot slot = AvailabilitySlot.builder()
                    .doctorId(doctor.getId())
                    .dayOfWeek(dayOfWeek)
                    .startTime(dto.getStartTime())
                    .endTime(dto.getEndTime())
                    .slotDate(dto.getSlotDate())
                    .isAvailable(true)
                    .maxPatients(maxPatients)
                    .build();
            savedSlots.add(slotRepository.save(slot));
        }

        return savedSlots.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public AvailabilitySlotDto updateSlot(Long userId, Long slotId, AvailabilitySlotDto dto) {
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        AvailabilitySlot slot = slotRepository.findByIdForUpdate(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found"));

        if (!slot.getDoctorId().equals(doctor.getId())) {
            throw new UnauthorizedException("Not authorized to update this slot");
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
            throw new UnauthorizedException("Not authorized to delete this slot");
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

    public AvailabilitySlotDto findSlot(Long doctorId, LocalDate date, LocalTime startTime) {
        return slotRepository.findByDoctorIdAndSlotDateAndStartTime(doctorId, date, startTime)
                .map(this::toDto)
                .orElse(null);
    }

    @Transactional
    public AvailabilitySlotDto consumeSlot(Long slotId) {
        AvailabilitySlot slot = slotRepository.findByIdForUpdate(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found"));

        int newBookings = (slot.getCurrentBookings() != null ? slot.getCurrentBookings() : 0) + 1;
        slot.setCurrentBookings(newBookings);
        if (newBookings >= slot.getMaxPatients()) {
            slot.setIsAvailable(false);
        }
        slot = slotRepository.save(slot);
        return toDto(slot);
    }

    @Transactional
    public AvailabilitySlotDto releaseSlot(Long slotId) {
        AvailabilitySlot slot = slotRepository.findByIdForUpdate(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found"));

        int newBookings = Math.max(0, (slot.getCurrentBookings() != null ? slot.getCurrentBookings() : 0) - 1);
        slot.setCurrentBookings(newBookings);
        if (newBookings < slot.getMaxPatients()) {
            slot.setIsAvailable(true);
        }
        slot = slotRepository.save(slot);
        return toDto(slot);
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
                .currentBookings(slot.getCurrentBookings())
                .build();
    }
}
