package com.intellimed.doctor.repository;

import com.intellimed.doctor.entity.AvailabilitySlot;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface AvailabilitySlotRepository extends JpaRepository<AvailabilitySlot, Long> {
    List<AvailabilitySlot> findByDoctorIdAndSlotDate(Long doctorId, LocalDate date);
    List<AvailabilitySlot> findByDoctorId(Long doctorId);
    List<AvailabilitySlot> findByDoctorIdAndIsAvailableTrue(Long doctorId);
}
