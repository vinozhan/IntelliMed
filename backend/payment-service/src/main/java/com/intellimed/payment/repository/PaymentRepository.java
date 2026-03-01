package com.intellimed.payment.repository;

import com.intellimed.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByAppointmentId(Long appointmentId);
    List<Payment> findByPatientIdOrderByPaidAtDesc(Long patientId);
    Optional<Payment> findByStripePaymentIntentId(String paymentIntentId);
}
