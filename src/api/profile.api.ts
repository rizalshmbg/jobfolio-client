import { api } from '@lib/api';

import type { ProfileResponse, UpdateProfileInput } from '@/types/profile';

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
