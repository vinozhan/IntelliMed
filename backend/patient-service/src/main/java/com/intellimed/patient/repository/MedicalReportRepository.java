package com.intellimed.patient.repository;

import com.intellimed.patient.entity.MedicalReport;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MedicalReportRepository extends JpaRepository<MedicalReport, Long> {
    List<MedicalReport> findByPatientIdOrderByUploadedAtDesc(Long patientId);
}
