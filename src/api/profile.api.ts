import { api } from '@lib/api';

import type {
  ChangePasswordInput,
  ChangePasswordResponse,
  ProfileResponse,
  UpdateProfileInput,
} from '@/types/profile';

export const getProfile = async (): Promise<ProfileResponse> => {
  const response = await api.get<ProfileResponse>('/profile');

  return response.data;
};

export const updateProfile = async (
  data: UpdateProfileInput,
): Promise<ProfileResponse> => {
  const response = await api.patch<ProfileResponse>('/profile', data);

  return response.data;
};

export const changePassword = async (
  data: ChangePasswordInput,
): Promise<ChangePasswordResponse> => {
  const response = await api.patch<ChangePasswordResponse>(
    '/profile/password',
    data,
  );

  return response.data;
};
