import axiosInstance from './axiosInstance';

export const createAppointment = (data) => axiosInstance.post('/api/appointments', data);
export const getAppointment = (id) => axiosInstance.get(`/api/appointments/${id}`);
export const getPatientAppointments = () => axiosInstance.get('/api/appointments/patient');
export const getDoctorAppointments = () => axiosInstance.get('/api/appointments/doctor');
export const updateAppointment = (id, data) => axiosInstance.put(`/api/appointments/${id}`, data);
export const cancelAppointment = (id, reason) =>
  axiosInstance.put(`/api/appointments/${id}/cancel`, { reason });
export const confirmAppointment = (id) => axiosInstance.put(`/api/appointments/${id}/confirm`);
export const completeAppointment = (id) => axiosInstance.put(`/api/appointments/${id}/complete`);
