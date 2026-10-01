import type { ApplicationListParams } from '@/types/application';

export const queryKeys = {
  profile: ['profile'] as const,
  resume: ['resume'] as const,
  dashboard: ['dashboard'] as const,
  applications: {
    all: ['applications'] as const,
    list: (params: ApplicationListParams) => ['applications', params] as const,
    detail: (id: string) => ['application', id] as const,
    activities: (id: string) => ['application', id, 'activities'] as const,
  },
};
