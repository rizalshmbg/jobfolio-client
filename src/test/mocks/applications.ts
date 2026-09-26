import { http, HttpResponse } from 'msw';
import { vi } from 'vitest';

import type { Application, ApplicationDetailResponse } from '@/types/application';
import { server } from './server';

export const applicationsUrl = `${import.meta.env.VITE_API_URL}/applications`;
export const application: Application = {
  id: 'application-1',
  company: 'Acme',
  position: 'Frontend Engineer',
  status: 'INTERVIEW',
  appliedAt: '2026-09-20T12:00:00',
  jobUrl: 'https://example.com/jobs/frontend',
  location: 'Jakarta',
  employmentType: 'FULL_TIME',
  workArrangement: 'REMOTE',
  salaryMin: 8000000,
  salaryMax: 12000000,
  notes: 'Prepare a portfolio for the interview.',
  createdAt: '2026-09-19T12:00:00',
  updatedAt: '2026-09-21T12:00:00',
  userId: 'user-1',
};
export const applicationUrl = `${applicationsUrl}/${application.id}`;
export const emptyOptionalFields = {
  appliedAt: null,
  jobUrl: null,
  location: null,
  employmentType: null,
  workArrangement: null,
  salaryMin: null,
  salaryMax: null,
  notes: null,
};

export function detailResponse(overrides: Partial<Application> = {}): ApplicationDetailResponse {
  return { success: true, message: 'Application retrieved', data: { ...application, ...overrides } };
}

export function mockApplicationDetails(overrides: Partial<Application> = {}) {
  const request = vi.fn(() => HttpResponse.json(detailResponse(overrides)));
  server.use(http.get(applicationUrl, request));
  return request;
}
