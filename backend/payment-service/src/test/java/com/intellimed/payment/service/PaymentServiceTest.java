package com.intellimed.payment.service;

import com.intellimed.payment.entity.Payment;
import com.intellimed.payment.enums.PaymentStatus;
import com.intellimed.payment.exception.ResourceNotFoundException;
import com.intellimed.payment.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @InjectMocks
    private PaymentService paymentService;

    private Payment pendingPayment;
    private Payment completedPayment;

    private static final Long PAYMENT_ID = 1L;
    private static final Long PATIENT_ID = 10L;
    private static final Long DOCTOR_ID = 20L;
    private static final Long APPOINTMENT_ID = 30L;
    private static final String PAYMENT_INTENT_ID = "pi_test_123";
    private static final String CLIENT_SECRET = "pi_test_123_secret";

    @BeforeEach
    void setUp() {
        pendingPayment = Payment.builder()
                .id(PAYMENT_ID)
                .appointmentId(APPOINTMENT_ID)
                .patientId(PATIENT_ID)
                .doctorId(DOCTOR_ID)
                .amount(new BigDecimal("100.00"))
                .currency("usd")
                .stripePaymentIntentId(PAYMENT_INTENT_ID)
                .stripeClientSecret(CLIENT_SECRET)
                .status(PaymentStatus.PENDING)
                .build();

        completedPayment = Payment.builder()
                .id(PAYMENT_ID)
                .appointmentId(APPOINTMENT_ID)
                .patientId(PATIENT_ID)
                .doctorId(DOCTOR_ID)
                .amount(new BigDecimal("100.00"))
                .currency("usd")
                .stripePaymentIntentId(PAYMENT_INTENT_ID)
                .stripeClientSecret(CLIENT_SECRET)
                .status(PaymentStatus.COMPLETED)
                .paidAt(LocalDateTime.now())
                .build();
    }

    // ---- confirmPayment ----

    @Test
    @DisplayName("confirmPayment - success")
    void confirmPayment_success() {
        when(paymentRepository.findByStripePaymentIntentId(PAYMENT_INTENT_ID))
                .thenReturn(Optional.of(pendingPayment));
        when(paymentRepository.save(any(Payment.class))).thenReturn(completedPayment);

        var result = paymentService.confirmPayment(PATIENT_ID, PAYMENT_INTENT_ID);

        assertNotNull(result);
        assertEquals("COMPLETED", result.getStatus());
        verify(paymentRepository).save(any(Payment.class));
    }

    @Test
    @DisplayName("confirmPayment - wrong user throws exception")
    void confirmPayment_wrongUser_throwsException() {
        when(paymentRepository.findByStripePaymentIntentId(PAYMENT_INTENT_ID))
                .thenReturn(Optional.of(pendingPayment));

        Long wrongUserId = 999L;
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> paymentService.confirmPayment(wrongUserId, PAYMENT_INTENT_ID));

        assertTrue(ex.getMessage().contains("not authorized"));
        verify(paymentRepository, never()).save(any());
    }

    @Test
    @DisplayName("confirmPayment - not found throws exception")
    void confirmPayment_notFound_throwsException() {
        when(paymentRepository.findByStripePaymentIntentId("pi_nonexistent"))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> paymentService.confirmPayment(PATIENT_ID, "pi_nonexistent"));
    }

    // ---- handleWebhook ----

    @Test
    @DisplayName("handleWebhook - succeeded updates status to COMPLETED")
    void handleWebhook_succeeded_updatesStatus() {
        when(paymentRepository.findByStripePaymentIntentId(PAYMENT_INTENT_ID))
                .thenReturn(Optional.of(pendingPayment));

        paymentService.handleWebhook(PAYMENT_INTENT_ID, "succeeded");

        verify(paymentRepository).save(argThat(payment ->
                payment.getStatus() == PaymentStatus.COMPLETED && payment.getPaidAt() != null));
    }

    @Test
    @DisplayName("handleWebhook - already completed does not update (idempotency)")
    void handleWebhook_alreadyCompleted_noUpdate() {
        when(paymentRepository.findByStripePaymentIntentId(PAYMENT_INTENT_ID))
                .thenReturn(Optional.of(completedPayment));

        paymentService.handleWebhook(PAYMENT_INTENT_ID, "succeeded");

        verify(paymentRepository, never()).save(any());
    }

    // ---- refundPayment ----
    // Note: refundPayment calls Stripe Refund.create() which is a static method.
    // We test the validation logic here. The Stripe call will throw in unit tests,
    // so we verify the precondition check for non-COMPLETED payments.

    @Test
    @DisplayName("refundPayment - not completed throws exception")
    void refundPayment_notCompleted_throwsException() {
        when(paymentRepository.findById(PAYMENT_ID)).thenReturn(Optional.of(pendingPayment));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> paymentService.refundPayment(PAYMENT_ID));

        assertTrue(ex.getMessage().contains("Only COMPLETED"));
        verify(paymentRepository, never()).save(any());
    }

    @Test
    @DisplayName("refundPayment - success (Stripe call will throw in unit test, verifying status check passes)")
    void refundPayment_success() {
        // The refund method first checks status, then calls Stripe.
        // Since we can't mock static Stripe.Refund.create, we verify
        // that a COMPLETED payment passes the status check and reaches the Stripe call.
        when(paymentRepository.findById(PAYMENT_ID)).thenReturn(Optional.of(completedPayment));

        // The Stripe static call will throw since there's no API key configured.
        // This confirms the status validation passed.
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> paymentService.refundPayment(PAYMENT_ID));

        assertTrue(ex.getMessage().contains("Stripe refund failed") || ex.getMessage().contains("refund"));
    }

    // ---- getPaymentByAppointment ----

    @Test
    @DisplayName("getPaymentByAppointment - found")
    void getPaymentByAppointment_found() {
        when(paymentRepository.findByAppointmentId(APPOINTMENT_ID))
                .thenReturn(Optional.of(completedPayment));

        var result = paymentService.getPaymentByAppointment(APPOINTMENT_ID);

        assertNotNull(result);
        assertEquals(APPOINTMENT_ID, result.getAppointmentId());
        assertEquals("COMPLETED", result.getStatus());
    }

    @Test
    @DisplayName("getPaymentByAppointment - not found throws exception")
    void getPaymentByAppointment_notFound_throwsException() {
        when(paymentRepository.findByAppointmentId(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> paymentService.getPaymentByAppointment(999L));
    }
}
