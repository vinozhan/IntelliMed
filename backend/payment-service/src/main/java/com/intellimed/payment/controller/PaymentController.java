package com.intellimed.payment.controller;

import com.intellimed.payment.dto.CreatePaymentRequest;
import com.intellimed.payment.dto.PaymentDto;
import com.intellimed.payment.service.PaymentService;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    @PostMapping("/create-intent")
    public ResponseEntity<PaymentDto> createPaymentIntent(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody CreatePaymentRequest request) {
        return ResponseEntity.ok(paymentService.createPaymentIntent(userId, request));
    }

    @PostMapping("/confirm")
    public ResponseEntity<PaymentDto> confirmPayment(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(paymentService.confirmPayment(body.get("paymentIntentId")));
    }

    @GetMapping("/appointment/{id}")
    public ResponseEntity<PaymentDto> getPaymentByAppointment(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getPaymentByAppointment(id));
    }

    @GetMapping("/patient")
    public ResponseEntity<List<PaymentDto>> getPatientPayments(
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(paymentService.getPatientPayments(userId));
    }

    @GetMapping("/admin")
    public ResponseEntity<List<PaymentDto>> getAllPayments(
            @RequestHeader("X-User-Role") String role) {
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {
        try {
            Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);

            if ("payment_intent.succeeded".equals(event.getType())) {
                PaymentIntent intent = (PaymentIntent) event.getDataObjectDeserializer()
                        .getObject().orElse(null);
                if (intent != null) {
                    paymentService.handleWebhook(intent.getId(), "succeeded");
                }
            }

            return ResponseEntity.ok("OK");
        } catch (Exception e) {
            log.error("Webhook error: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Webhook error");
        }
    }

    @PostMapping("/{id}/refund")
    public ResponseEntity<PaymentDto> refundPayment(
            @PathVariable Long id,
            @RequestHeader("X-User-Role") String role) {
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(paymentService.refundPayment(id));
    }
}
