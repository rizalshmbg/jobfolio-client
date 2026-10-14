import { api } from '@lib/api';
import type { MatchResponse } from '../types/jobs-matching';

export const matchApplication = async (
  applicationId: string,
): Promise<MatchResponse> => {
  const response = await api.post<MatchResponse>(
    `/jobs/matching/applications/${applicationId}`,
  );

  return response.data;
};
