import { useMutation } from '@tanstack/react-query';

import { matchApplication } from '@api/job-matching.api';

export const useApplicationMatching = () => {
  return useMutation({
    mutationFn: (applicationId: string) => matchApplication(applicationId),
  });
};
