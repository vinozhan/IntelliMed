package com.intellimed.appointment.repository;

import com.intellimed.appointment.entity.Appointment;
import com.intellimed.appointment.enums.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByPatientIdOrderByAppointmentDateDesc(Long patientId);
    List<Appointment> findByDoctorIdOrderByAppointmentDateDesc(Long doctorId);
    List<Appointment> findByDoctorUserIdOrderByAppointmentDateDesc(Long doctorUserId);
    List<Appointment> findByDoctorIdAndStatus(Long doctorId, AppointmentStatus status);
}
