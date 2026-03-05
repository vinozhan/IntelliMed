package com.intellimed.doctor.repository;

import com.intellimed.doctor.entity.Prescription;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    List<Prescription> findByDoctorIdOrderByIssuedAtDesc(Long doctorId);
    Page<Prescription> findByDoctorIdOrderByIssuedAtDesc(Long doctorId, Pageable pageable);
    List<Prescription> findByPatientIdOrderByIssuedAtDesc(Long patientId);
    Page<Prescription> findByPatientIdOrderByIssuedAtDesc(Long patientId, Pageable pageable);
    List<Prescription> findByAppointmentId(Long appointmentId);
}
