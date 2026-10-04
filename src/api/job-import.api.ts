import { api } from '@lib/api';
import type { JobImportResponse } from '../types/jobs-import';

export const importJob = async (url: string): Promise<JobImportResponse> => {
  const response = await api.post<JobImportResponse>('/jobs/import', { url });

  return response.data;
};
