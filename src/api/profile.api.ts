import { api } from '@lib/axios';

import type { ProfileResponse } from '@/types/profile';

export const getProfile = async (): Promise<ProfileResponse> => {
  const response = await api.get<ProfileResponse>('/profile');

  return response.data;
};
