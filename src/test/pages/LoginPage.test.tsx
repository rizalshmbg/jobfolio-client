import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Toaster } from '@/components/ui/sonner';
import LoginPage from '@pages/LoginPage';
import { useAuthStore } from '@stores/auth.store';
import { getAccessToken } from '@lib/auth-token';
import { loginResponse, loginUrl } from '@/test/mocks/handlers';
import { server } from '@/test/mocks/server';
import { renderWithProviders } from '@/test/utils/render-with-providers';

const credentials = { email: 'rizal@example.com', password: 'password123' };

function renderLoginPage() {
  const user = userEvent.setup();

  renderWithProviders(
    <>
      <Routes>
        <Route path='/login' element={<LoginPage />} />
        <Route path='/dashboard' element={<h1>Dashboard</h1>} />
      </Routes>
      <Toaster />
    </>,
    { initialEntries: ['/login'] },
  );

  return user;
}

async function submitLogin(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/email address/i), credentials.email);
  await user.type(screen.getByLabelText(/password/i), credentials.password);
  await user.click(screen.getByRole('button', { name: /^log in$/i }));
}

describe('LoginPage', () => {
  beforeEach(() => {
    useAuthStore.getState().setUnauthenticated();
  });

  it('sends credentials, authenticates the user, and navigates to the dashboard', async () => {
    const receivedCredentials = vi.fn();
    server.use(
      http.post(loginUrl, async ({ request }) => {
        receivedCredentials(await request.json());
        return HttpResponse.json(loginResponse);
      }),
    );

    const user = renderLoginPage();
    await submitLogin(user);

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeVisible();
    expect(await screen.findByText(/logged in\. welcome back!/i)).toBeVisible();
    expect(receivedCredentials).toHaveBeenCalledExactlyOnceWith(credentials);
    expect(getAccessToken()).toBe('test-access-token');
    expect(useAuthStore.getState().status).toBe('authenticated');
    expect(useAuthStore.getState().user).toEqual(loginResponse.data.user);
  });

  it.each([
    { name: 'empty fields', email: '', password: '', passwordError: true },
    {
      name: 'an invalid email',
      email: 'invalid-email',
      password: 'password123',
      passwordError: false,
    },
  ])('rejects $name without making a login request', async ({ email, password, passwordError }) => {
    const loginRequest = vi.fn(() => HttpResponse.json(loginResponse));
    server.use(http.post(loginUrl, loginRequest));

    const user = renderLoginPage();
    if (email) await user.type(screen.getByLabelText(/email address/i), email);
    if (password) await user.type(screen.getByLabelText(/password/i), password);
    await user.click(screen.getByRole('button', { name: /^log in$/i }));

    expect(await screen.findByText('Please enter a valid email address')).toBeVisible();
    expect(screen.getByLabelText(/email address/i)).toBeInvalid();
    if (passwordError) {
      expect(screen.getByText('Password is required')).toBeVisible();
      expect(screen.getByLabelText(/password/i)).toBeInvalid();
    }
    expect(loginRequest).not.toHaveBeenCalled();
    expect(getAccessToken()).toBeNull();
    expect(useAuthStore.getState().status).toBe('unauthenticated');
  });

  it.each([
    { status: 401, message: 'Invalid email or password' },
    { status: 500, message: 'Something went wrong. Please try again.' },
  ])('shows the API error for HTTP $status and allows another attempt', async ({ status, message }) => {
    server.use(
      http.post(loginUrl, () =>
        HttpResponse.json({ success: false, message }, { status }),
      ),
    );

    const user = renderLoginPage();
    await submitLogin(user);

    expect(await screen.findByText(message)).toBeVisible();
    expect(screen.getByRole('button', { name: /^log in$/i })).toBeEnabled();
    expect(screen.queryByRole('heading', { name: 'Dashboard' })).not.toBeInTheDocument();
    expect(getAccessToken()).toBeNull();
    expect(useAuthStore.getState().status).toBe('unauthenticated');
    expect(useAuthStore.getState().user).toBeNull();

    // Restore the default successful response for the user's next attempt.
    server.resetHandlers();
    await user.click(screen.getByRole('button', { name: /^log in$/i }));
    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  it('disables the submit button while the login request is pending', async () => {
    // Hold the response until the loading assertions finish, avoiding timed sleeps.
    let finishRequest!: () => void;
    const pendingResponse = new Promise<void>((resolve) => {
      finishRequest = resolve;
    });
    const loginRequest = vi.fn(async () => {
      await pendingResponse;
      return HttpResponse.json(loginResponse);
    });
    server.use(http.post(loginUrl, loginRequest));

    const user = renderLoginPage();
    try {
      await submitLogin(user);
      const button = await screen.findByRole('button', { name: /logging in/i });
      expect(button).toBeDisabled();
      await user.click(button);
      await waitFor(() => expect(loginRequest).toHaveBeenCalledTimes(1));
      expect(getAccessToken()).toBeNull();
    } finally {
      finishRequest();
    }

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });
});
