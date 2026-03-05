package com.intellimed.doctor.repository;

import com.intellimed.doctor.entity.Doctor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Optional<Doctor> findByUserId(Long userId);
    List<Doctor> findBySpecialtyContainingIgnoreCase(String specialty);
    List<Doctor> findBySpecialtyContainingIgnoreCaseAndIsVerifiedTrue(String specialty);
    Page<Doctor> findBySpecialtyContainingIgnoreCaseAndIsVerifiedTrue(String specialty, Pageable pageable);
    List<Doctor> findByIsVerifiedTrueAndFirstNameContainingIgnoreCaseOrIsVerifiedTrueAndLastNameContainingIgnoreCase(String firstName, String lastName);
    Page<Doctor> findByIsVerifiedTrueAndFirstNameContainingIgnoreCaseOrIsVerifiedTrueAndLastNameContainingIgnoreCase(String firstName, String lastName, Pageable pageable);
    List<Doctor> findByIsVerifiedFalse();
    List<Doctor> findByIsVerifiedTrue();
    Page<Doctor> findByIsVerifiedTrue(Pageable pageable);
    long countByIsVerifiedTrue();
    long countByIsVerifiedFalse();
}
