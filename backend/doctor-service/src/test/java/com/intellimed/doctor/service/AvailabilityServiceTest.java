package com.intellimed.doctor.service;

import com.intellimed.doctor.dto.AvailabilitySlotDto;
import com.intellimed.doctor.entity.AvailabilitySlot;
import com.intellimed.doctor.entity.Doctor;
import com.intellimed.doctor.exception.ResourceNotFoundException;
import com.intellimed.doctor.repository.AvailabilitySlotRepository;
import com.intellimed.doctor.repository.DoctorRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AvailabilityServiceTest {

    @Mock
    private AvailabilitySlotRepository slotRepository;

    @Mock
    private DoctorRepository doctorRepository;

    @InjectMocks
    private AvailabilityService availabilityService;

    private Doctor doctor;
    private AvailabilitySlot slot;

    private static final Long USER_ID = 1L;
    private static final Long DOCTOR_ID = 10L;
    private static final Long SLOT_ID = 100L;
    private static final LocalDate SLOT_DATE = LocalDate.of(2026, 4, 15);
    private static final LocalTime START = LocalTime.of(9, 0);
    private static final LocalTime END = LocalTime.of(9, 30);

    @BeforeEach
    void setUp() {
        doctor = Doctor.builder()
                .id(DOCTOR_ID)
                .userId(USER_ID)
                .firstName("John")
                .lastName("Smith")
                .specialty("Cardiology")
                .build();

        slot = AvailabilitySlot.builder()
                .id(SLOT_ID)
                .doctorId(DOCTOR_ID)
                .dayOfWeek("WEDNESDAY")
                .startTime(START)
                .endTime(END)
                .slotDate(SLOT_DATE)
                .isAvailable(true)
                .maxPatients(1)
                .currentBookings(0)
                .build();
    }

    // ---- createSlot ----

    @Test
    @DisplayName("createSlot - single slot success (no duration)")
    void createSlot_singleSlot_success() {
        AvailabilitySlotDto dto = AvailabilitySlotDto.builder()
                .startTime(START)
                .endTime(END)
                .slotDate(SLOT_DATE)
                .maxPatients(1)
                .build();

        when(doctorRepository.findByUserId(USER_ID)).thenReturn(Optional.of(doctor));
        when(slotRepository.save(any(AvailabilitySlot.class))).thenReturn(slot);

        List<AvailabilitySlotDto> result = availabilityService.createSlot(USER_ID, dto);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(START, result.get(0).getStartTime());
        assertEquals(END, result.get(0).getEndTime());
        verify(slotRepository, times(1)).save(any(AvailabilitySlot.class));
    }

    @Test
    @DisplayName("createSlot - multiple slots with duration")
    void createSlot_multipleSlots_withDuration() {
        AvailabilitySlotDto dto = AvailabilitySlotDto.builder()
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(10, 0))
                .slotDate(SLOT_DATE)
                .slotDurationMinutes(30)
                .maxPatients(1)
                .build();

        when(doctorRepository.findByUserId(USER_ID)).thenReturn(Optional.of(doctor));
        when(slotRepository.save(any(AvailabilitySlot.class))).thenAnswer(invocation -> {
            AvailabilitySlot s = invocation.getArgument(0);
            s.setId(SLOT_ID);
            return s;
        });

        List<AvailabilitySlotDto> result = availabilityService.createSlot(USER_ID, dto);

        assertEquals(2, result.size());
        verify(slotRepository, times(2)).save(any(AvailabilitySlot.class));
    }

    // ---- updateSlot ----

    @Test
    @DisplayName("updateSlot - success")
    void updateSlot_success() {
        AvailabilitySlotDto dto = AvailabilitySlotDto.builder()
                .dayOfWeek("THURSDAY")
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(10, 30))
                .slotDate(SLOT_DATE)
                .isAvailable(true)
                .maxPatients(2)
                .build();

        AvailabilitySlot updated = AvailabilitySlot.builder()
                .id(SLOT_ID).doctorId(DOCTOR_ID)
                .dayOfWeek("THURSDAY")
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(10, 30))
                .slotDate(SLOT_DATE)
                .isAvailable(true).maxPatients(2).currentBookings(0).build();

        when(doctorRepository.findByUserId(USER_ID)).thenReturn(Optional.of(doctor));
        when(slotRepository.findByIdForUpdate(SLOT_ID)).thenReturn(Optional.of(slot));
        when(slotRepository.save(any(AvailabilitySlot.class))).thenReturn(updated);

        AvailabilitySlotDto result = availabilityService.updateSlot(USER_ID, SLOT_ID, dto);

        assertEquals("THURSDAY", result.getDayOfWeek());
        assertEquals(LocalTime.of(10, 0), result.getStartTime());
        verify(slotRepository).save(any(AvailabilitySlot.class));
    }

    @Test
    @DisplayName("updateSlot - wrong doctor throws exception")
    void updateSlot_wrongDoctor_throwsException() {
        Doctor otherDoctor = Doctor.builder().id(999L).userId(2L).build();
        AvailabilitySlotDto dto = AvailabilitySlotDto.builder().build();

        when(doctorRepository.findByUserId(2L)).thenReturn(Optional.of(otherDoctor));
        when(slotRepository.findByIdForUpdate(SLOT_ID)).thenReturn(Optional.of(slot));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> availabilityService.updateSlot(2L, SLOT_ID, dto));

        assertTrue(ex.getMessage().contains("Not authorized"));
        verify(slotRepository, never()).save(any());
    }

    // ---- deleteSlot ----

    @Test
    @DisplayName("deleteSlot - success")
    void deleteSlot_success() {
        when(doctorRepository.findByUserId(USER_ID)).thenReturn(Optional.of(doctor));
        when(slotRepository.findById(SLOT_ID)).thenReturn(Optional.of(slot));

        availabilityService.deleteSlot(USER_ID, SLOT_ID);

        verify(slotRepository).delete(slot);
    }

    // ---- consumeSlot ----

    @Test
    @DisplayName("consumeSlot - success")
    void consumeSlot_success() {
        AvailabilitySlot consumed = AvailabilitySlot.builder()
                .id(SLOT_ID).doctorId(DOCTOR_ID).startTime(START).endTime(END)
                .slotDate(SLOT_DATE).isAvailable(true).maxPatients(2).currentBookings(1).build();

        slot.setMaxPatients(2);
        slot.setCurrentBookings(0);

        when(slotRepository.findByIdForUpdate(SLOT_ID)).thenReturn(Optional.of(slot));
        when(slotRepository.save(any(AvailabilitySlot.class))).thenReturn(consumed);

        AvailabilitySlotDto result = availabilityService.consumeSlot(SLOT_ID);

        assertEquals(1, result.getCurrentBookings());
        verify(slotRepository).save(any(AvailabilitySlot.class));
    }

    @Test
    @DisplayName("consumeSlot - reaches max patients sets unavailable")
    void consumeSlot_reachesMax_setsUnavailable() {
        slot.setMaxPatients(1);
        slot.setCurrentBookings(0);

        AvailabilitySlot consumed = AvailabilitySlot.builder()
                .id(SLOT_ID).doctorId(DOCTOR_ID).startTime(START).endTime(END)
                .slotDate(SLOT_DATE).isAvailable(false).maxPatients(1).currentBookings(1).build();

        when(slotRepository.findByIdForUpdate(SLOT_ID)).thenReturn(Optional.of(slot));
        when(slotRepository.save(any(AvailabilitySlot.class))).thenReturn(consumed);

        AvailabilitySlotDto result = availabilityService.consumeSlot(SLOT_ID);

        assertFalse(result.getIsAvailable());
        assertEquals(1, result.getCurrentBookings());
        verify(slotRepository).save(argThat(s -> !s.getIsAvailable()));
    }

    // ---- releaseSlot ----

    @Test
    @DisplayName("releaseSlot - success")
    void releaseSlot_success() {
        slot.setCurrentBookings(2);
        slot.setMaxPatients(3);
        slot.setIsAvailable(true);

        AvailabilitySlot released = AvailabilitySlot.builder()
                .id(SLOT_ID).doctorId(DOCTOR_ID).startTime(START).endTime(END)
                .slotDate(SLOT_DATE).isAvailable(true).maxPatients(3).currentBookings(1).build();

        when(slotRepository.findByIdForUpdate(SLOT_ID)).thenReturn(Optional.of(slot));
        when(slotRepository.save(any(AvailabilitySlot.class))).thenReturn(released);

        AvailabilitySlotDto result = availabilityService.releaseSlot(SLOT_ID);

        assertEquals(1, result.getCurrentBookings());
        assertTrue(result.getIsAvailable());
    }

    @Test
    @DisplayName("releaseSlot - sets available when below max")
    void releaseSlot_setsAvailable() {
        slot.setCurrentBookings(1);
        slot.setMaxPatients(1);
        slot.setIsAvailable(false);

        AvailabilitySlot released = AvailabilitySlot.builder()
                .id(SLOT_ID).doctorId(DOCTOR_ID).startTime(START).endTime(END)
                .slotDate(SLOT_DATE).isAvailable(true).maxPatients(1).currentBookings(0).build();

        when(slotRepository.findByIdForUpdate(SLOT_ID)).thenReturn(Optional.of(slot));
        when(slotRepository.save(any(AvailabilitySlot.class))).thenReturn(released);

        AvailabilitySlotDto result = availabilityService.releaseSlot(SLOT_ID);

        assertTrue(result.getIsAvailable());
        assertEquals(0, result.getCurrentBookings());
        verify(slotRepository).save(argThat(s -> s.getIsAvailable()));
    }
}
