import { api } from '@lib/axios';

import type { LoginInput, RegisterInput } from '@validations/auth.validations';

import type {
  LoginResponse,
  LogoutResponse,
  RefreshResponse,
  RegisterResponse,
} from '@/types/auth';

export const register = async (
  data: RegisterInput,
): Promise<RegisterResponse> => {
  const response = await api.post<RegisterResponse>('/auth/register', data);

  return response.data;
};

export const login = async (data: LoginInput): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', data);

  return response.data;
};

export const refreshAccessToken = async (): Promise<RefreshResponse> => {
  const response = await api.post<RefreshResponse>('/auth/refresh');

  return response.data;
};

export const logout = async (): Promise<LogoutResponse> => {
  const response = await api.post<LogoutResponse>('/auth/logout');

  return response.data;
};
