import { api } from '@/lib/api';
import type {
  ResumeResponse,
  DeleteResumeResponse,
} from '@/types/resume';

export const getResume = async (): Promise<ResumeResponse> => {
  const response = await api.get<ResumeResponse>('/profile/resume');

  return response.data;
};

export const uploadResume = async (file: File): Promise<ResumeResponse> => {
  const formData = new FormData();

  formData.append('file', file);

  const response = await api.post<ResumeResponse>('/profile/resume', formData);

  return response.data;
};

export const deleteResume = async (): Promise<DeleteResumeResponse> => {
  const response = await api.delete<DeleteResumeResponse>('/profile/resume');

  return response.data;
};
