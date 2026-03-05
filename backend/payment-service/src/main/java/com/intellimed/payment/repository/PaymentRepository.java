package com.intellimed.payment.repository;

import com.intellimed.payment.entity.Payment;
import com.intellimed.payment.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByAppointmentId(Long appointmentId);
    List<Payment> findByPatientIdOrderByPaidAtDesc(Long patientId);
    Page<Payment> findByPatientIdOrderByPaidAtDesc(Long patientId, Pageable pageable);
    Optional<Payment> findByStripePaymentIntentId(String paymentIntentId);
    List<Payment> findAllByOrderByPaidAtDesc();
    Page<Payment> findAllByOrderByPaidAtDesc(Pageable pageable);
    long countByStatus(PaymentStatus status);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = :status")
    BigDecimal sumAmountByStatus(@org.springframework.data.repository.query.Param("status") PaymentStatus status);
}
