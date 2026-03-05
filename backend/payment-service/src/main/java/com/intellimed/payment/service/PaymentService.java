package com.intellimed.payment.service;

import com.intellimed.payment.dto.CreatePaymentRequest;
import com.intellimed.payment.dto.PaymentDto;
import com.intellimed.payment.entity.Payment;
import com.intellimed.payment.enums.PaymentStatus;
import com.intellimed.payment.exception.ResourceNotFoundException;
import com.intellimed.payment.exception.UnauthorizedException;
import com.intellimed.payment.repository.PaymentRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.RefundCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;

    @Transactional
    public PaymentDto createPaymentIntent(Long patientId, CreatePaymentRequest request) {
        try {
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(request.getAmount().longValue() * 100) // cents
                    .setCurrency(request.getCurrency() != null ? request.getCurrency() : "usd")
                    .putMetadata("appointmentId", String.valueOf(request.getAppointmentId()))
                    .putMetadata("patientId", String.valueOf(patientId))
                    .build();

            PaymentIntent intent = PaymentIntent.create(params);

            Payment payment = Payment.builder()
                    .appointmentId(request.getAppointmentId())
                    .patientId(patientId)
                    .doctorId(request.getDoctorId())
                    .amount(request.getAmount())
                    .currency(request.getCurrency() != null ? request.getCurrency() : "usd")
                    .stripePaymentIntentId(intent.getId())
                    .stripeClientSecret(intent.getClientSecret())
                    .status(PaymentStatus.PENDING)
                    .build();

            payment = paymentRepository.save(payment);
            return toDto(payment, true);
        } catch (StripeException e) {
            throw new RuntimeException("Failed to create payment intent: " + e.getMessage());
        }
    }

    @Transactional
    public PaymentDto confirmPayment(Long userId, String paymentIntentId) {
        Payment payment = paymentRepository.findByStripePaymentIntentId(paymentIntentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
        if (!payment.getPatientId().equals(userId)) {
            throw new UnauthorizedException("You are not authorized to confirm this payment");
        }
        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setPaidAt(LocalDateTime.now());
        payment = paymentRepository.save(payment);
        return toDto(payment, false);
    }

    public PaymentDto getPaymentByAppointment(Long appointmentId) {
        Payment payment = paymentRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
        return toDto(payment, false);
    }

    public List<PaymentDto> getPatientPayments(Long patientId) {
        return paymentRepository.findByPatientIdOrderByPaidAtDesc(patientId)
                .stream().map(p -> toDto(p, false)).collect(Collectors.toList());
    }

    public Page<PaymentDto> getPatientPayments(Long patientId, int page, int size) {
        return paymentRepository.findByPatientIdOrderByPaidAtDesc(patientId, PageRequest.of(page, size))
                .map(p -> toDto(p, false));
    }

    public List<PaymentDto> getAllPayments() {
        return paymentRepository.findAllByOrderByPaidAtDesc()
                .stream().map(p -> toDto(p, false)).collect(Collectors.toList());
    }

    public Page<PaymentDto> getAllPayments(int page, int size) {
        return paymentRepository.findAllByOrderByPaidAtDesc(PageRequest.of(page, size))
                .map(p -> toDto(p, false));
    }

    public Map<String, Object> getStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalPayments", paymentRepository.count());
        for (PaymentStatus status : PaymentStatus.values()) {
            stats.put(status.name().toLowerCase() + "Count", paymentRepository.countByStatus(status));
        }
        stats.put("totalRevenue", paymentRepository.sumAmountByStatus(PaymentStatus.COMPLETED));
        return stats;
    }

    @Transactional
    public PaymentDto refundPayment(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        if (payment.getStatus() != PaymentStatus.COMPLETED) {
            throw new RuntimeException("Only COMPLETED payments can be refunded");
        }

        // Call Stripe Refund API
        try {
            RefundCreateParams refundParams = RefundCreateParams.builder()
                    .setPaymentIntent(payment.getStripePaymentIntentId())
                    .build();
            Refund.create(refundParams);
        } catch (StripeException e) {
            throw new RuntimeException("Stripe refund failed: " + e.getMessage());
        }

        payment.setStatus(PaymentStatus.REFUNDED);
        payment = paymentRepository.save(payment);
        return toDto(payment, false);
    }

    @Transactional
    public void handleWebhook(String paymentIntentId, String status) {
        paymentRepository.findByStripePaymentIntentId(paymentIntentId).ifPresent(payment -> {
            if ("succeeded".equals(status) && payment.getStatus() == PaymentStatus.PENDING) {
                payment.setStatus(PaymentStatus.COMPLETED);
                payment.setPaidAt(LocalDateTime.now());
                paymentRepository.save(payment);
            } else if ("payment_failed".equals(status) && payment.getStatus() == PaymentStatus.PENDING) {
                payment.setStatus(PaymentStatus.FAILED);
                paymentRepository.save(payment);
            }
        });
    }

    private PaymentDto toDto(Payment p, boolean includeClientSecret) {
        return PaymentDto.builder()
                .id(p.getId())
                .appointmentId(p.getAppointmentId())
                .patientId(p.getPatientId())
                .doctorId(p.getDoctorId())
                .amount(p.getAmount())
                .currency(p.getCurrency())
                .status(p.getStatus().name())
                .stripePaymentIntentId(p.getStripePaymentIntentId())
                .stripeClientSecret(includeClientSecret ? p.getStripeClientSecret() : null)
                .paidAt(p.getPaidAt() != null ? p.getPaidAt().toString() : null)
                .build();
    }
}
