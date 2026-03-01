import axiosInstance from './axiosInstance';

export const getAllUsers = () => axiosInstance.get('/api/admin/users');
export const updateUserStatus = (id, isActive) =>
  axiosInstance.put(`/api/admin/users/${id}/status`, { isActive });
