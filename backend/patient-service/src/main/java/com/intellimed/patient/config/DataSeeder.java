package com.intellimed.patient.config;

import com.intellimed.patient.entity.User;
import com.intellimed.patient.enums.Role;
import com.intellimed.patient.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.email}")
    private String adminEmail;

    @Value("${admin.password}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        if (userRepository.findByEmail(adminEmail).isEmpty()) {
            User admin = User.builder()
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .role(Role.ADMIN)
                    .firstName("System")
                    .lastName("Admin")
                    .isActive(true)
                    .build();
            userRepository.save(admin);
            log.info("Default admin account created: {}", adminEmail);
        } else {
            log.info("Admin account already exists: {}", adminEmail);
        }
    }
}
