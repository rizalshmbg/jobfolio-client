import axios from 'axios';

const axiosConfig = {
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
};

export const api = axios.create(axiosConfig);

export const refreshApi = axios.create(axiosConfig);
