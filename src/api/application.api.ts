import { api } from '@lib/api';
import type {
  ApplicationListParams,
  ApplicationsResponse,
} from '../types/application';

export const getApplications = async (
  params: ApplicationListParams = {},
): Promise<ApplicationsResponse> => {
  const response = await api.get<ApplicationsResponse>('/applications', {
    params,
  });

  return response.data;
};
