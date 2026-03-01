import axiosInstance from './axiosInstance';

export const getPatientProfile = () => axiosInstance.get('/api/patients/profile');
export const updatePatientProfile = (data) => axiosInstance.put('/api/patients/profile', data);
export const getPatientById = (id) => axiosInstance.get(`/api/patients/${id}`);
export const uploadReport = (formData) =>
  axiosInstance.post('/api/patients/reports', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const getReports = () => axiosInstance.get('/api/patients/reports');
export const getReportsByPatientId = (patientId) =>
  axiosInstance.get(`/api/patients/${patientId}/reports`);
export const getPrescriptionsByPatientId = (patientId) =>
  axiosInstance.get(`/api/patients/${patientId}/prescriptions`);
