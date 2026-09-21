import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { getAccessToken } from '@lib/auth-token';
import { api } from '@lib/api';
import { refreshAccessTokenOnce } from '@lib/refresh-token';
import { useAuthStore } from '@stores/auth.store';

type RetryRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

export const setupAxiosInterceptors = () => {
  // Request interceptor
  api.interceptors.request.use((config) => {
    const accessToken = getAccessToken();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  });

  // Response interceptor
  api.interceptors.response.use(
    (response) => response,

    async (error: AxiosError) => {
      const originalRequest = error.config as RetryRequestConfig | undefined;

      if (
        error.response?.status !== 401 ||
        !originalRequest ||
        originalRequest._retry
      ) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        await refreshAccessTokenOnce();

        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().setUnauthenticated();

        return Promise.reject(refreshError);
      }
    },
  );
};
