import axiosInstance from './axiosInstance';

export const checkSymptoms = (data) => axiosInstance.post('/api/ai/symptom-check', data);
export const getSymptomHistory = () => axiosInstance.get('/api/ai/symptom-check/history');
