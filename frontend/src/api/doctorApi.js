import axiosInstance from './axiosInstance';

export const createDoctorProfile = (data) => axiosInstance.post('/api/doctors', data);
export const getDoctorProfile = () => axiosInstance.get('/api/doctors/profile');
export const updateDoctorProfile = (data) => axiosInstance.put('/api/doctors/profile', data);
export const getDoctorById = (id) => axiosInstance.get(`/api/doctors/${id}`);
export const searchDoctors = (params) => axiosInstance.get('/api/doctors', { params });
export const getSpecialties = () => axiosInstance.get('/api/doctors/specialties');

export const createAvailability = (data) => axiosInstance.post('/api/doctors/availability', data);
export const updateAvailability = (slotId, data) =>
  axiosInstance.put(`/api/doctors/availability/${slotId}`, data);
export const deleteAvailability = (slotId) =>
  axiosInstance.delete(`/api/doctors/availability/${slotId}`);
export const getDoctorAvailability = (doctorId, date) =>
  axiosInstance.get(`/api/doctors/${doctorId}/availability`, { params: { date } });

export const createPrescription = (data) => axiosInstance.post('/api/doctors/prescriptions', data);
export const updatePrescription = (id, data) => axiosInstance.put(`/api/doctors/prescriptions/${id}`, data);
export const getDoctorPrescriptions = () => axiosInstance.get('/api/doctors/prescriptions');

export const getUnverifiedDoctors = () => axiosInstance.get('/api/doctors/unverified');
export const verifyDoctor = (id) => axiosInstance.put(`/api/doctors/${id}/verify`);
