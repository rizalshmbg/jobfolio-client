import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { deleteResume, getResume, uploadResume } from '@api/resume.api';
import { queryKeys } from '@lib/query-keys';

export const useResume = () => {
  return useQuery({
    queryKey: queryKeys.resume,
    queryFn: async () => {
      try {
        const response = await getResume();

        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          return null;
        }

        throw error;
      }
    },
  });
};

export const useUploadResume = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadResume,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resume });
    },
  });
};

export const useDeleteResume = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteResume,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resume });
    },
  });
};
