import axiosInstance from './axiosInstance';

export const createPaymentIntent = (data) => axiosInstance.post('/api/payments/create-intent', data);
export const confirmPayment = (paymentIntentId) =>
  axiosInstance.post('/api/payments/confirm', { paymentIntentId });
export const getPaymentByAppointment = (appointmentId) =>
  axiosInstance.get(`/api/payments/appointment/${appointmentId}`);
export const getPatientPayments = () => axiosInstance.get('/api/payments/patient');
export const refundPayment = (id) => axiosInstance.post(`/api/payments/${id}/refund`);
