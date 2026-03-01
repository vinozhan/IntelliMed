package com.intellimed.payment.service;

import com.intellimed.payment.dto.CreatePaymentRequest;
import com.intellimed.payment.dto.PaymentDto;
import com.intellimed.payment.entity.Payment;
import com.intellimed.payment.enums.PaymentStatus;
import com.intellimed.payment.exception.ResourceNotFoundException;
import com.intellimed.payment.repository.PaymentRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;

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
            return toDto(payment);
        } catch (StripeException e) {
            throw new RuntimeException("Failed to create payment intent: " + e.getMessage());
        }
    }

    public PaymentDto confirmPayment(String paymentIntentId) {
        Payment payment = paymentRepository.findByStripePaymentIntentId(paymentIntentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setPaidAt(LocalDateTime.now());
        payment = paymentRepository.save(payment);
        return toDto(payment);
    }

    public PaymentDto getPaymentByAppointment(Long appointmentId) {
        Payment payment = paymentRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
        return toDto(payment);
    }

    public List<PaymentDto> getPatientPayments(Long patientId) {
        return paymentRepository.findByPatientIdOrderByPaidAtDesc(patientId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public PaymentDto refundPayment(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
        payment.setStatus(PaymentStatus.REFUNDED);
        payment = paymentRepository.save(payment);
        return toDto(payment);
    }

    public void handleWebhook(String paymentIntentId, String status) {
        paymentRepository.findByStripePaymentIntentId(paymentIntentId).ifPresent(payment -> {
            if ("succeeded".equals(status)) {
                payment.setStatus(PaymentStatus.COMPLETED);
                payment.setPaidAt(LocalDateTime.now());
            } else if ("payment_failed".equals(status)) {
                payment.setStatus(PaymentStatus.FAILED);
            }
            paymentRepository.save(payment);
        });
    }

    private PaymentDto toDto(Payment p) {
        return PaymentDto.builder()
                .id(p.getId())
                .appointmentId(p.getAppointmentId())
                .patientId(p.getPatientId())
                .doctorId(p.getDoctorId())
                .amount(p.getAmount())
                .currency(p.getCurrency())
                .status(p.getStatus().name())
                .stripePaymentIntentId(p.getStripePaymentIntentId())
                .stripeClientSecret(p.getStripeClientSecret())
                .paidAt(p.getPaidAt() != null ? p.getPaidAt().toString() : null)
                .build();
    }
}
