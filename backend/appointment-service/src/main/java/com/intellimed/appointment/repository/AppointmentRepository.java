package com.intellimed.appointment.repository;

import com.intellimed.appointment.entity.Appointment;
import com.intellimed.appointment.enums.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByPatientIdOrderByAppointmentDateDesc(Long patientId);
    List<Appointment> findByDoctorIdOrderByAppointmentDateDesc(Long doctorId);
    List<Appointment> findByDoctorUserIdOrderByAppointmentDateDesc(Long doctorUserId);
    List<Appointment> findByDoctorIdAndStatus(Long doctorId, AppointmentStatus status);

    @Query("SELECT COUNT(a) > 0 FROM Appointment a WHERE a.doctorId = :doctorId " +
            "AND a.appointmentDate = :date " +
            "AND a.status NOT IN (com.intellimed.appointment.enums.AppointmentStatus.CANCELLED, " +
            "com.intellimed.appointment.enums.AppointmentStatus.REJECTED) " +
            "AND a.startTime < :endTime AND a.endTime > :startTime")
    boolean existsOverlappingAppointment(@Param("doctorId") Long doctorId,
                                         @Param("date") LocalDate date,
                                         @Param("startTime") LocalTime startTime,
                                         @Param("endTime") LocalTime endTime);
}
