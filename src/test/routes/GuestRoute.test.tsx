import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { Route, Routes, useNavigate } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import type { RefreshResponse } from '@/types/auth';
import type { ProfileResponse } from '@/types/profile';
import { getAccessToken, setAccessToken } from '@lib/auth-token';
import GuestRoute from '@routes/GuestRoute';
import { useAuthStore } from '@stores/auth.store';
import { server } from '@/test/mocks/server';
import { renderWithProviders } from '@/test/utils/render-with-providers';

const refreshUrl = `${import.meta.env.VITE_API_URL}/auth/refresh`;
const profileUrl = `${import.meta.env.VITE_API_URL}/profile`;
const refreshResponse: RefreshResponse = {
  success: true,
  message: 'Token refreshed',
  data: { accessToken: 'refreshed-access-token' },
};
const profileResponse: ProfileResponse = {
  success: true,
  message: 'Profile retrieved',
  data: {
    id: 'user-1',
    name: 'Rizal',
    email: 'rizal@example.com',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
};

function mockSession() {
  const refreshRequest = vi.fn(async () => HttpResponse.json(refreshResponse));
  const profileRequest = vi.fn(async () => HttpResponse.json(profileResponse));
  server.use(
    http.post(refreshUrl, refreshRequest),
    http.get(profileUrl, profileRequest),
  );
  return { refreshRequest, profileRequest };
}

function DashboardDestination() {
  const navigate = useNavigate();
  return (
    <>
      <h1>Dashboard</h1>
      <button onClick={() => navigate(-1)}>Go back</button>
    </>
  );
}

function renderGuestRoute(initialEntries = ['/login']) {
  return renderWithProviders(
    <Routes>
      <Route path='/' element={<h1>Home</h1>} />
      <Route path='/dashboard' element={<DashboardDestination />} />
      <Route element={<GuestRoute />}>
        <Route path='/login' element={<h1>Log in</h1>} />
        <Route path='/register' element={<h1>Create an account</h1>} />
      </Route>
    </Routes>,
    { initialEntries },
  );
}

function expectUnauthenticated() {
  expect(screen.queryByRole('heading', { name: 'Dashboard' })).not.toBeInTheDocument();
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  expect(getAccessToken()).toBeNull();
  expect(useAuthStore.getState().status).toBe('unauthenticated');
  expect(useAuthStore.getState().user).toBeNull();
}

function deferredResponse() {
  let resolve!: () => void;
  const promise = new Promise<void>((finish) => {
    resolve = finish;
  });
  return { promise, resolve };
}

describe('GuestRoute', () => {
  it.each([
    { path: '/login', heading: 'Log in' },
    { path: '/register', heading: 'Create an account' },
  ])('renders $path for a guest without initializing again', ({ path, heading }) => {
    const { refreshRequest, profileRequest } = mockSession();
    useAuthStore.getState().setUnauthenticated();

    renderGuestRoute([path]);

    expect(screen.getByRole('heading', { name: heading })).toBeVisible();
    expectUnauthenticated();
    expect(refreshRequest).not.toHaveBeenCalled();
    expect(profileRequest).not.toHaveBeenCalled();
  });

  it.each(['/login', '/register'])(
    'redirects an authenticated user from %s and replaces the guest history entry',
    async (path) => {
      const { refreshRequest, profileRequest } = mockSession();
      useAuthStore.getState().setAuthenticated(profileResponse.data);
      setAccessToken('existing-access-token');
      const user = userEvent.setup();

      renderGuestRoute(['/', path]);

      expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeVisible();
      expect(screen.queryByRole('heading', { name: 'Log in' })).not.toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Create an account' })).not.toBeInTheDocument();
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
      expect(getAccessToken()).toBe('existing-access-token');
      await user.click(screen.getByRole('button', { name: 'Go back' }));
      expect(await screen.findByRole('heading', { name: 'Home' })).toBeVisible();
      expect(refreshRequest).not.toHaveBeenCalled();
      expect(profileRequest).not.toHaveBeenCalled();
    },
  );

  it('shows loading until refresh and profile requests succeed, then redirects to the dashboard', async () => {
    const { refreshRequest, profileRequest } = mockSession();
    const refresh = deferredResponse();
    const profile = deferredResponse();
    refreshRequest.mockImplementationOnce(async () => {
      await refresh.promise;
      return HttpResponse.json(refreshResponse);
    });
    profileRequest.mockImplementationOnce(async () => {
      await profile.promise;
      return HttpResponse.json(profileResponse);
    });

    renderGuestRoute();

    try {
      expect(screen.getByRole('status')).toHaveTextContent('Getting your workspace ready...');
      expect(screen.queryByRole('heading', { name: 'Log in' })).not.toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Dashboard' })).not.toBeInTheDocument();
      await waitFor(() => expect(refreshRequest).toHaveBeenCalledTimes(1));
      expect(profileRequest).not.toHaveBeenCalled();

      refresh.resolve();
      await waitFor(() => expect(profileRequest).toHaveBeenCalledTimes(1));
      expect(getAccessToken()).toBe('refreshed-access-token');
      expect(useAuthStore.getState().status).toBe('checking');
      expect(screen.getByRole('status')).toBeVisible();
      expect(screen.queryByRole('heading', { name: 'Log in' })).not.toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Dashboard' })).not.toBeInTheDocument();
    } finally {
      // Release pending requests even if an assertion fails.
      refresh.resolve();
      profile.resolve();
    }

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeVisible();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Log in' })).not.toBeInTheDocument();
    expect(useAuthStore.getState().status).toBe('authenticated');
    expect(useAuthStore.getState().user).toEqual(profileResponse.data);
    expect(refreshRequest).toHaveBeenCalledTimes(1);
    expect(profileRequest).toHaveBeenCalledTimes(1);
  });

  it('clears a stale token and shows login when refresh fails without fetching the profile', async () => {
    const { refreshRequest, profileRequest } = mockSession();
    setAccessToken('stale-access-token');
    refreshRequest.mockImplementationOnce(async () =>
      HttpResponse.json({ success: false, message: 'Session expired' }, { status: 401 }),
    );

    renderGuestRoute();

    expect(await screen.findByRole('heading', { name: 'Log in' })).toBeVisible();
    expectUnauthenticated();
    expect(refreshRequest).toHaveBeenCalledTimes(1);
    expect(profileRequest).not.toHaveBeenCalled();
  });

  it('clears the refreshed token and shows login when the profile request fails', async () => {
    const { refreshRequest, profileRequest } = mockSession();
    profileRequest.mockImplementationOnce(async () =>
      HttpResponse.json({ success: false, message: 'Profile unavailable' }, { status: 500 }),
    );

    renderGuestRoute();

    expect(await screen.findByRole('heading', { name: 'Log in' })).toBeVisible();
    expectUnauthenticated();
    expect(refreshRequest).toHaveBeenCalledTimes(1);
    expect(profileRequest).toHaveBeenCalledTimes(1);
  });

  it('removes guest content and redirects when the user becomes authenticated', async () => {
    const { refreshRequest, profileRequest } = mockSession();
    useAuthStore.getState().setUnauthenticated();
    renderGuestRoute();
    expect(screen.getByRole('heading', { name: 'Log in' })).toBeVisible();

    act(() => {
      setAccessToken('new-access-token');
      useAuthStore.getState().setAuthenticated(profileResponse.data);
    });

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'Log in' })).not.toBeInTheDocument();
    expect(getAccessToken()).toBe('new-access-token');
    expect(refreshRequest).not.toHaveBeenCalled();
    expect(profileRequest).not.toHaveBeenCalled();
  });
});
