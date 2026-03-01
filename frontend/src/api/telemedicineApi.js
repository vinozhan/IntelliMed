import axiosInstance from './axiosInstance';

export const createSession = (data) => axiosInstance.post('/api/telemedicine/sessions', data);
export const getSession = (appointmentId) =>
  axiosInstance.get(`/api/telemedicine/sessions/${appointmentId}`);
export const startSession = (id) => axiosInstance.put(`/api/telemedicine/sessions/${id}/start`);
export const endSession = (id) => axiosInstance.put(`/api/telemedicine/sessions/${id}/end`);
export const getJoinInfo = (id) => axiosInstance.get(`/api/telemedicine/sessions/${id}/join-info`);
