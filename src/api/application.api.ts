import { api } from '@lib/api';
import type {
  ApplicationListParams,
  ApplicationsResponse,
  ApplicationDetailResponse,
  CreateApplicationInput,
  UpdateApplicationInput,
} from '../types/application';

export const getApplications = async (
  params: ApplicationListParams = {},
): Promise<ApplicationsResponse> => {
  const response = await api.get<ApplicationsResponse>('/applications', {
    params,
  });

  return response.data;
};

export const getApplicationById = async (
  id: string,
): Promise<ApplicationDetailResponse> => {
  const response = await api.get<ApplicationDetailResponse>(
    `/applications/${id}`,
  );

  return response.data;
};

export const createApplication = async (
  data: CreateApplicationInput,
): Promise<ApplicationDetailResponse> => {
  const response = await api.post<ApplicationDetailResponse>(
    '/applications',
    data,
  );

  return response.data;
};

export const updateApplication = async (
  id: string,
  data: UpdateApplicationInput,
): Promise<ApplicationDetailResponse> => {
  const response = await api.patch<ApplicationDetailResponse>(
    `applications/${id}`,
    data,
  );

  return response.data;
};
