import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { Route, Routes, useParams } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { DashboardResponse } from '@/types/dashboard';
import { queryKeys } from '@lib/query-keys';
import DashboardPage from '@pages/DashboardPage';
import { useAuthStore } from '@stores/auth.store';
import { loginResponse } from '@/test/mocks/handlers';
import { server } from '@/test/mocks/server';
import { deferredResponse } from '@/test/utils/application-tests';
import { renderWithProviders } from '@/test/utils/render-with-providers';

const dashboardUrl = `${import.meta.env.VITE_API_URL}/dashboard`;
const dashboardResponse: DashboardResponse = {
  success: true,
  message: 'Dashboard retrieved',
  data: {
    summary: {
      total: 36, wishlist: 1, applied: 2, screening: 3, interview: 4,
      technicalTest: 5, offer: 6, rejected: 7, withdrawn: 8,
    },
    recentApplications: [
      {
        id: 'application-1', company: 'Acme', position: 'Frontend Engineer',
        status: 'INTERVIEW', appliedAt: '2026-09-20T12:00:00', updatedAt: '2026-09-22T12:00:00',
      },
      {
        id: 'application-2', company: 'Beta', position: 'Product Designer',
        status: 'WISHLIST', appliedAt: null, updatedAt: '2026-09-21T12:00:00',
      },
    ],
  },
};
const emptyDashboard: DashboardResponse = {
  ...dashboardResponse,
  data: {
    summary: {
      total: 0, wishlist: 0, applied: 0, screening: 0, interview: 0,
      technicalTest: 0, offer: 0, rejected: 0, withdrawn: 0,
    },
    recentApplications: [],
  },
};

function mockDashboard(response = dashboardResponse) {
  const request = vi.fn(() => HttpResponse.json(response));
  server.use(http.get(dashboardUrl, request));
  return request;
}

function DetailDestination() {
  const { id } = useParams();
  return <h1>Application details: {id}</h1>;
}

function renderDashboard() {
  const user = userEvent.setup();
  const result = renderWithProviders(
    <Routes>
      <Route path='/dashboard' element={<DashboardPage />} />
      <Route path='/applications' element={<h1>Applications list</h1>} />
      <Route path='/applications/new' element={<h1>New application</h1>} />
      <Route path='/applications/:id' element={<DetailDestination />} />
    </Routes>,
    { initialEntries: ['/dashboard'] },
  );
  return { user, ...result };
}

function sectionWithHeading(name: string) {
  return within(screen.getByRole('heading', { name }).closest('section')!);
}

describe('DashboardPage', () => {
  beforeEach(() => {
    useAuthStore.getState().setAuthenticated({
      ...loginResponse.data.user, name: 'Rizal Sihombing',
    });
  });

  it('shows loading until the dashboard request completes and greets the user by first name', async () => {
    const pending = deferredResponse();
    const dashboardRequest = vi.fn(async () => {
      await pending.promise;
      return HttpResponse.json(dashboardResponse);
    });
    server.use(http.get(dashboardUrl, dashboardRequest));
    renderDashboard();
    try {
      expect(screen.getByRole('status', { name: 'Loading page' })).toBeVisible();
      expect(screen.queryByRole('heading', { name: 'Total applications' })).not.toBeInTheDocument();
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
      await waitFor(() => expect(dashboardRequest).toHaveBeenCalledTimes(1));
    } finally {
      pending.resolve();
      await screen.findByRole('heading', { name: 'Welcome back, Rizal.' });
    }
    expect(screen.queryByRole('status', { name: 'Loading page' })).not.toBeInTheDocument();
    expect(dashboardRequest).toHaveBeenCalledTimes(1);
  });

  it('renders summary metrics, computes active applications, and exposes all stage counts', async () => {
    mockDashboard();
    renderDashboard();
    await screen.findByRole('heading', { name: 'Total applications' });
    expect(sectionWithHeading('Total applications').getByText('36')).toBeVisible();
    // Only applied, screening, interview, and technical test contribute to active.
    expect(sectionWithHeading('In progress').getByText('14')).toBeVisible();
    expect(sectionWithHeading('Interviews').getByText('04')).toBeVisible();
    expect(sectionWithHeading('Offers received').getByText('06')).toBeVisible();
    expect(screen.getByRole('img', {
      name: '36 total applications; 14 in progress; 6 offers; 7 rejected; 8 withdrawn; 1 on wishlist.',
    })).toBeVisible();
    const stages = [
      ['Wishlist', '1'], ['Applied', '2'], ['Screening', '3'], ['Interview', '4'],
      ['Technical test', '5'], ['Offer', '6'], ['Rejected', '7'], ['Withdrawn', '8'],
    ];
    for (const [name, count] of stages) {
      const legendEntry = sectionWithHeading('Status breakdown').getByText(name).parentElement!;
      expect(within(legendEntry).getByText(count)).toBeVisible();
    }
    for (const [name, count] of stages.slice(0, 6)) {
      const pipelineEntry = sectionWithHeading('Application pipeline').getByText(name).parentElement!;
      expect(within(pipelineEntry).getByText(count)).toBeVisible();
    }
  });

  it('renders recent applications in API order with statuses, formatted dates, and an unapplied fallback', async () => {
    mockDashboard();
    renderDashboard();
    const table = await screen.findByRole('table');
    const rows = within(table).getAllByRole('row');
    expect(rows).toHaveLength(3);
    for (const text of ['Frontend Engineer', 'Acme', 'Interview', '20/09/2026', '22/09/2026']) {
      expect(within(rows[1]).getByText(text)).toBeVisible();
    }
    for (const text of ['Product Designer', 'Beta', 'Wishlist', 'Not applied yet', '21/09/2026']) {
      expect(within(rows[2]).getByText(text)).toBeVisible();
    }
  });

  it('shows zero metrics and the first-application prompt for an empty dashboard', async () => {
    mockDashboard(emptyDashboard);
    const { user } = renderDashboard();
    expect(await screen.findByRole('heading', { name: 'Your next chapter starts here' })).toBeVisible();
    for (const name of ['Total applications', 'In progress', 'Interviews', 'Offers received']) {
      expect(sectionWithHeading(name).getByText('00')).toBeVisible();
    }
    expect(screen.getByRole('img', {
      name: '0 total applications; 0 in progress; 0 offers; 0 rejected; 0 withdrawn; 0 on wishlist.',
    })).toBeVisible();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    await user.click(sectionWithHeading('Recent applications').getByRole('link', { name: 'Add application' }));
    expect(await screen.findByRole('heading', { name: 'New application' })).toBeVisible();
  });

  it('uses the generic welcome heading when user information is unavailable', async () => {
    mockDashboard();
    useAuthStore.getState().setUnauthenticated();
    renderDashboard();
    expect(await screen.findByRole('heading', { name: 'Welcome back.' })).toBeVisible();
  });

  it.each([500, 'network'] as const)('shows a %s error and recovers when Try again is clicked', async (failure) => {
    const message = failure === 'network' ? 'Network Error' : 'Dashboard unavailable';
    const dashboardRequest = vi.fn()
      .mockImplementationOnce(() => failure === 'network' ? HttpResponse.error()
        : HttpResponse.json({ message }, { status: failure }))
      .mockImplementation(() => HttpResponse.json(dashboardResponse));
    server.use(http.get(dashboardUrl, dashboardRequest));
    const { user } = renderDashboard();
    expect(await screen.findByRole('alert')).toHaveTextContent(message);
    expect(screen.queryByRole('heading', { name: 'Total applications' })).not.toBeInTheDocument();
    expect(dashboardRequest).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByRole('heading', { name: 'Welcome back, Rizal.' })).toBeVisible();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(dashboardRequest).toHaveBeenCalledTimes(2);
  });

  it.each([
    { link: 'Add application', heading: 'New application', path: '/applications/new' },
    { link: 'View all', heading: 'Applications list', path: '/applications' },
    { link: /^Frontend Engineer\s*Acme$/, heading: 'Application details: application-1', path: '/applications/application-1' },
    { link: 'View Product Designer at Beta', heading: 'Application details: application-2', path: '/applications/application-2' },
  ])('navigates to $path through its dashboard link', async ({ link, heading, path }) => {
    mockDashboard();
    const { user } = renderDashboard();
    await screen.findByRole('table');
    const target = screen.getByRole('link', { name: link });
    expect(target).toHaveAttribute('href', path);
    await user.click(target);
    expect(await screen.findByRole('heading', { name: heading })).toBeVisible();
  });

  it('refreshes visible metrics and recent applications when the dashboard cache is invalidated', async () => {
    const dashboardRequest = vi.fn()
      .mockImplementationOnce(() => HttpResponse.json(dashboardResponse))
      .mockImplementation(() => HttpResponse.json(emptyDashboard));
    server.use(http.get(dashboardUrl, dashboardRequest));
    const { queryClient } = renderDashboard();
    await screen.findByRole('table');
    expect(sectionWithHeading('Total applications').getByText('36')).toBeVisible();

    await act(async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    });

    expect(await screen.findByRole('heading', { name: 'Your next chapter starts here' })).toBeVisible();
    expect(sectionWithHeading('Total applications').getByText('00')).toBeVisible();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(dashboardRequest).toHaveBeenCalledTimes(2);
    expect(queryClient.getQueryData(queryKeys.dashboard)).toEqual(emptyDashboard);
  });
});
