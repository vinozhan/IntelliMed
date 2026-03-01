package com.intellimed.doctor.repository;

import com.intellimed.doctor.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    List<Prescription> findByDoctorIdOrderByIssuedAtDesc(Long doctorId);
    List<Prescription> findByPatientIdOrderByIssuedAtDesc(Long patientId);
    List<Prescription> findByAppointmentId(Long appointmentId);
}
