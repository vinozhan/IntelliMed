import axiosInstance from './axiosInstance';

export const getAllUsers = () => axiosInstance.get('/api/admin/users');
export const updateUserStatus = (id, isActive) =>
  axiosInstance.put(`/api/admin/users/${id}/status`, { isActive });
export const getAdminStats = () => axiosInstance.get('/api/admin/stats');
export const getDoctorStats = () => axiosInstance.get('/api/doctors/stats');
export const getAppointmentStats = () => axiosInstance.get('/api/appointments/stats');
export const getPaymentStats = () => axiosInstance.get('/api/payments/stats');
export const getAllPaymentsAdmin = (page, size) =>
  axiosInstance.get('/api/payments/admin', { params: { page, size } });
