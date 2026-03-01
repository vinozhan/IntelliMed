package com.intellimed.ai.repository;

import com.intellimed.ai.entity.SymptomCheckLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SymptomCheckLogRepository extends JpaRepository<SymptomCheckLog, Long> {
    List<SymptomCheckLog> findByPatientIdOrderByCreatedAtDesc(Long patientId);
}
