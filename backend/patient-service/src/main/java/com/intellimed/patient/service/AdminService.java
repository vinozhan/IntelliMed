package com.intellimed.patient.service;

import com.intellimed.patient.dto.UserDto;
import com.intellimed.patient.entity.User;
import com.intellimed.patient.enums.Role;
import com.intellimed.patient.exception.ResourceNotFoundException;
import com.intellimed.patient.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public Page<UserDto> getAllUsers(int page, int size) {
        return userRepository.findAll(PageRequest.of(page, size))
                .map(this::toDto);
    }

    public Map<String, Object> getStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("patientCount", userRepository.countByRole(Role.PATIENT));
        stats.put("doctorCount", userRepository.countByRole(Role.DOCTOR));
        stats.put("adminCount", userRepository.countByRole(Role.ADMIN));
        stats.put("activeUsers", userRepository.countByIsActive(true));
        stats.put("inactiveUsers", userRepository.countByIsActive(false));
        return stats;
    }

    public UserDto updateUserStatus(Long userId, Boolean isActive) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setIsActive(isActive);
        userRepository.save(user);
        return toDto(user);
    }

    private UserDto toDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .isActive(user.getIsActive())
                .build();
    }
}
