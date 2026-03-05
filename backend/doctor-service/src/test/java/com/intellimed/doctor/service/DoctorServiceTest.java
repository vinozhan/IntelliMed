package com.intellimed.doctor.service;

import com.intellimed.doctor.dto.DoctorCreateRequest;
import com.intellimed.doctor.dto.DoctorDto;
import com.intellimed.doctor.entity.Doctor;
import com.intellimed.doctor.exception.ResourceNotFoundException;
import com.intellimed.doctor.repository.DoctorRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DoctorServiceTest {

    @Mock
    private DoctorRepository doctorRepository;

    @InjectMocks
    private DoctorService doctorService;

    private Doctor doctor;
    private DoctorCreateRequest createRequest;

    private static final Long USER_ID = 1L;
    private static final Long DOCTOR_ID = 10L;

    @BeforeEach
    void setUp() {
        doctor = Doctor.builder()
                .id(DOCTOR_ID)
                .userId(USER_ID)
                .firstName("John")
                .lastName("Smith")
                .specialty("Cardiology")
                .qualification("MBBS, MD")
                .experienceYears(10)
                .consultationFee(150.0)
                .hospital("City Hospital")
                .isVerified(false)
                .rating(0.0)
                .build();

        createRequest = new DoctorCreateRequest();
        createRequest.setSpecialty("Cardiology");
        createRequest.setQualification("MBBS, MD");
        createRequest.setExperienceYears(10);
        createRequest.setConsultationFee(150.0);
        createRequest.setHospital("City Hospital");
    }

    // ---- createDoctor ----

    @Test
    @DisplayName("createDoctor - success")
    void createDoctor_success() {
        when(doctorRepository.findByUserId(USER_ID)).thenReturn(Optional.empty());
        when(doctorRepository.save(any(Doctor.class))).thenReturn(doctor);

        DoctorDto result = doctorService.createDoctor(USER_ID, "John", "Smith", createRequest);

        assertNotNull(result);
        assertEquals(DOCTOR_ID, result.getId());
        assertEquals("Cardiology", result.getSpecialty());
        assertEquals("John", result.getFirstName());
        verify(doctorRepository).save(any(Doctor.class));
    }

    // ---- getProfile ----

    @Test
    @DisplayName("getProfile - found")
    void getProfile_found() {
        when(doctorRepository.findByUserId(USER_ID)).thenReturn(Optional.of(doctor));

        DoctorDto result = doctorService.getProfile(USER_ID);

        assertNotNull(result);
        assertEquals(USER_ID, result.getUserId());
        assertEquals("Cardiology", result.getSpecialty());
    }

    @Test
    @DisplayName("getProfile - not found throws exception")
    void getProfile_notFound_throwsException() {
        when(doctorRepository.findByUserId(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> doctorService.getProfile(999L));
    }

    // ---- getDoctorById ----

    @Test
    @DisplayName("getDoctorById - found")
    void getDoctorById_found() {
        when(doctorRepository.findById(DOCTOR_ID)).thenReturn(Optional.of(doctor));

        DoctorDto result = doctorService.getDoctorById(DOCTOR_ID);

        assertNotNull(result);
        assertEquals(DOCTOR_ID, result.getId());
    }

    // ---- searchDoctors ----

    @Test
    @DisplayName("searchDoctors - by specialty")
    void searchDoctors_bySpecialty() {
        Doctor doctor2 = Doctor.builder()
                .id(11L).userId(2L).firstName("Jane").lastName("Doe")
                .specialty("Cardiology").isVerified(true).rating(4.5).build();

        when(doctorRepository.findBySpecialtyContainingIgnoreCaseAndIsVerifiedTrue("Cardiology"))
                .thenReturn(Arrays.asList(doctor, doctor2));

        List<DoctorDto> result = doctorService.searchDoctors("Cardiology", null);

        assertEquals(2, result.size());
        verify(doctorRepository).findBySpecialtyContainingIgnoreCaseAndIsVerifiedTrue("Cardiology");
    }

    @Test
    @DisplayName("searchDoctors - by name")
    void searchDoctors_byName() {
        when(doctorRepository.findByIsVerifiedTrueAndFirstNameContainingIgnoreCaseOrIsVerifiedTrueAndLastNameContainingIgnoreCase("John", "John"))
                .thenReturn(List.of(doctor));

        List<DoctorDto> result = doctorService.searchDoctors(null, "John");

        assertEquals(1, result.size());
        assertEquals("John", result.get(0).getFirstName());
    }

    // ---- verifyDoctor ----

    @Test
    @DisplayName("verifyDoctor - success")
    void verifyDoctor_success() {
        Doctor verified = Doctor.builder()
                .id(DOCTOR_ID).userId(USER_ID).firstName("John").lastName("Smith")
                .specialty("Cardiology").isVerified(true).rating(0.0).build();

        when(doctorRepository.findById(DOCTOR_ID)).thenReturn(Optional.of(doctor));
        when(doctorRepository.save(any(Doctor.class))).thenReturn(verified);

        DoctorDto result = doctorService.verifyDoctor(DOCTOR_ID);

        assertTrue(result.getIsVerified());
        verify(doctorRepository).save(argThat(d -> d.getIsVerified()));
    }
}
