import axiosInstance from './axiosInstance';

export const sendNotification = (data) => axiosInstance.post('/api/notifications/send', data);
export const getAllNotifications = () => axiosInstance.get('/api/notifications');
