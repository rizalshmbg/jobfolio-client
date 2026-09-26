import type { QueryClient } from '@tanstack/react-query';
import { queryKeys } from '@lib/query-keys';
import { application } from '@/test/mocks/applications';

export function deferredResponse() {
  let resolve!: () => void;
  const promise = new Promise<void>((finish) => { resolve = finish; });
  return { promise, resolve };
}

export const applicationListKeys = [
  queryKeys.applications.list({ page: 1 }),
  queryKeys.applications.list({ status: 'INTERVIEW' }),
];

export function seedApplicationCaches(queryClient: QueryClient) {
  for (const key of applicationListKeys) {
    queryClient.setQueryData(key, {
      success: true,
      data: [application],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });
  }
  queryClient.setQueryData(queryKeys.dashboard, { totalApplications: 1 });
}
