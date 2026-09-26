import { cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { Link, Route, Routes, useNavigate } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { LogoutResponse } from '@/types/auth';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import AppLayout from '@layouts/AppLayout';
import { api } from '@lib/api';
import { setupAxiosInterceptors } from '@lib/axios';
import { getAccessToken, setAccessToken } from '@lib/auth-token';
import ProtectedRoute from '@routes/ProtectedRoute';
import { useAuthStore } from '@stores/auth.store';
import { loginResponse } from '@/test/mocks/handlers';
import { server } from '@/test/mocks/server';
import { renderWithProviders } from '@/test/utils/render-with-providers';

const apiUrl = import.meta.env.VITE_API_URL;
const logoutUrl = `${apiUrl}/auth/logout`;
const logoutResponse: LogoutResponse = {
  success: true,
  message: 'Logged out',
};
const successMessage = 'You have been logged out successfully.';

function LoginDestination() {
  const navigate = useNavigate();
  return (
    <>
      <h1>Log in</h1>
      <button onClick={() => navigate(-1)}>Go back</button>
      <Link to='/dashboard'>Open workspace</Link>
    </>
  );
}

function renderWorkspace(initialEntries = ['/dashboard']) {
  const user = userEvent.setup();
  renderWithProviders(
    <TooltipProvider>
      <Routes>
        <Route path='/' element={<h1>Home</h1>} />
        <Route path='/login' element={<LoginDestination />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path='/dashboard' element={<h1>Private dashboard</h1>} />
          </Route>
        </Route>
      </Routes>
      <Toaster />
    </TooltipProvider>,
    { initialEntries },
  );
  return user;
}

function expectLoggedOut() {
  expect(getAccessToken()).toBeNull();
  expect(useAuthStore.getState().status).toBe('unauthenticated');
  expect(useAuthStore.getState().user).toBeNull();
  expect(screen.queryByRole('heading', { name: 'Private dashboard' })).not.toBeInTheDocument();
}

function expectSessionPreserved() {
  expect(getAccessToken()).toBe('test-access-token');
  expect(useAuthStore.getState().status).toBe('authenticated');
  expect(useAuthStore.getState().user).toEqual(loginResponse.data.user);
  expect(screen.getByRole('heading', { name: 'Private dashboard' })).toBeVisible();
  expect(screen.queryByRole('heading', { name: 'Log in' })).not.toBeInTheDocument();
}

describe('Logout', () => {
  beforeEach(() => {
    // jsdom needs matchMedia for the real sidebar's desktop/mobile hook.
    vi.stubGlobal('matchMedia', vi.fn((query: string): MediaQueryList => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(() => true),
    })));
    api.interceptors.request.clear();
    api.interceptors.response.clear();
    setupAxiosInterceptors();
    setAccessToken('test-access-token');
    useAuthStore.getState().setAuthenticated(loginResponse.data.user);
  });

  afterEach(() => {
    cleanup();
    api.interceptors.request.clear();
    api.interceptors.response.clear();
    vi.unstubAllGlobals();
  });

  it.each([200, 204])('clears the session on HTTP %s and replaces the workspace history entry with login', async (status) => {
    const receivedAuthorization = vi.fn();
    server.use(
      http.post(logoutUrl, ({ request }) => {
        receivedAuthorization(request.headers.get('Authorization'));
        return status === 204
          ? new HttpResponse(null, { status })
          : HttpResponse.json(logoutResponse);
      }),
    );

    const user = renderWorkspace(['/', '/dashboard']);
    await user.click(screen.getByRole('button', { name: /^log out$/i }));

    expect(await screen.findByRole('heading', { name: 'Log in' })).toBeVisible();
    expect(await screen.findByText(successMessage)).toBeVisible();
    expect(receivedAuthorization).toHaveBeenCalledExactlyOnceWith('Bearer test-access-token');
    expectLoggedOut();
    await user.click(screen.getByRole('button', { name: 'Go back' }));
    expect(await screen.findByRole('heading', { name: 'Home' })).toBeVisible();
  });

  it('disables logout while pending, prevents duplicate requests, and blocks workspace access afterward', async () => {
    let finishRequest!: () => void;
    const pendingResponse = new Promise<void>((resolve) => {
      finishRequest = resolve;
    });
    const logoutRequest = vi.fn(async () => {
      await pendingResponse;
      return HttpResponse.json(logoutResponse);
    });
    server.use(http.post(logoutUrl, logoutRequest));

    const user = renderWorkspace();
    try {
      await user.click(screen.getByRole('button', { name: /^log out$/i }));
      const button = await screen.findByRole('button', { name: /logging out/i });
      expect(button).toBeDisabled();
      await user.click(button);
      await waitFor(() => expect(logoutRequest).toHaveBeenCalledTimes(1));
      expectSessionPreserved();
    } finally {
      finishRequest();
      // Let success callbacks finish before cleanup, even if an assertion fails.
      await screen.findByRole('heading', { name: 'Log in' });
    }

    expect(await screen.findByRole('heading', { name: 'Log in' })).toBeVisible();
    expectLoggedOut();
    await user.click(screen.getByRole('link', { name: 'Open workspace' }));
    expect(await screen.findByRole('heading', { name: 'Log in' })).toBeVisible();
    expectLoggedOut();
    expect(logoutRequest).toHaveBeenCalledTimes(1);
  });

  it.each([
    { status: 403, message: 'Logout is not allowed' },
    { status: 500, message: 'Unable to log out. Please try again.' },
  ])('shows the HTTP $status error, preserves the session, and allows a successful retry', async ({ status, message }) => {
    const logoutRequest = vi.fn()
      .mockImplementationOnce(() => HttpResponse.json({ success: false, message }, { status }))
      .mockImplementation(() => HttpResponse.json(logoutResponse));
    server.use(http.post(logoutUrl, logoutRequest));

    const user = renderWorkspace();
    await user.click(screen.getByRole('button', { name: /^log out$/i }));

    expect(await screen.findByText(message)).toBeVisible();
    expect(screen.getByRole('button', { name: /^log out$/i })).toBeEnabled();
    expect(screen.queryByText(successMessage)).not.toBeInTheDocument();
    expectSessionPreserved();
    await user.click(screen.getByRole('button', { name: /^log out$/i }));
    expect(await screen.findByRole('heading', { name: 'Log in' })).toBeVisible();
    expect(await screen.findByText(successMessage)).toBeVisible();
    expect(logoutRequest).toHaveBeenCalledTimes(2);
    expectLoggedOut();
  });

  it('shows a network error and keeps the session available for another attempt', async () => {
    const logoutRequest = vi.fn(() => HttpResponse.error());
    server.use(http.post(logoutUrl, logoutRequest));

    const user = renderWorkspace();
    await user.click(screen.getByRole('button', { name: /^log out$/i }));

    expect(await screen.findByText('Network Error')).toBeVisible();
    expect(screen.getByRole('button', { name: /^log out$/i })).toBeEnabled();
    expect(screen.queryByText(successMessage)).not.toBeInTheDocument();
    expect(logoutRequest).toHaveBeenCalledTimes(1);
    expectSessionPreserved();
  });

  it('refreshes an expired token and retries logout before clearing the session', async () => {
    const refreshRequest = vi.fn(() => HttpResponse.json({
      success: true,
      data: { accessToken: 'refreshed-access-token' },
    }));
    const receivedAuthorization = vi.fn();
    server.use(
      http.post(logoutUrl, ({ request }) => {
        const authorization = request.headers.get('Authorization');
        receivedAuthorization(authorization);
        return authorization === 'Bearer refreshed-access-token'
          ? HttpResponse.json(logoutResponse)
          : HttpResponse.json({ message: 'Token expired' }, { status: 401 });
      }),
      http.post(`${apiUrl}/auth/refresh`, refreshRequest),
    );

    const user = renderWorkspace();
    await user.click(screen.getByRole('button', { name: /^log out$/i }));

    expect(await screen.findByRole('heading', { name: 'Log in' })).toBeVisible();
    expect(await screen.findByText(successMessage)).toBeVisible();
    expect(receivedAuthorization.mock.calls).toEqual([
      ['Bearer test-access-token'],
      ['Bearer refreshed-access-token'],
    ]);
    expect(refreshRequest).toHaveBeenCalledTimes(1);
    expectLoggedOut();
  });

  it('clears an expired session and redirects to login when token refresh fails during logout', async () => {
    const logoutRequest = vi.fn(() =>
      HttpResponse.json({ message: 'Token expired' }, { status: 401 }),
    );
    const refreshRequest = vi.fn(() =>
      HttpResponse.json({ message: 'Session expired' }, { status: 401 }),
    );
    server.use(
      http.post(logoutUrl, logoutRequest),
      http.post(`${apiUrl}/auth/refresh`, refreshRequest),
    );

    const user = renderWorkspace();
    await user.click(screen.getByRole('button', { name: /^log out$/i }));

    expect(await screen.findByRole('heading', { name: 'Log in' })).toBeVisible();
    expect(await screen.findByText('Session expired')).toBeVisible();
    expect(screen.queryByText(successMessage)).not.toBeInTheDocument();
    expect(logoutRequest).toHaveBeenCalledTimes(1);
    expect(refreshRequest).toHaveBeenCalledTimes(1);
    expectLoggedOut();
  });
});
