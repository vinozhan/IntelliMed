package com.intellimed.doctor.repository;

import com.intellimed.doctor.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Optional<Doctor> findByUserId(Long userId);
    List<Doctor> findBySpecialtyContainingIgnoreCase(String specialty);
    List<Doctor> findBySpecialtyContainingIgnoreCaseAndIsVerifiedTrue(String specialty);
    List<Doctor> findByIsVerifiedTrueAndFirstNameContainingIgnoreCaseOrIsVerifiedTrueAndLastNameContainingIgnoreCase(String firstName, String lastName);
    List<Doctor> findByIsVerifiedFalse();
    List<Doctor> findByIsVerifiedTrue();
}
