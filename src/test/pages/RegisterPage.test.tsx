import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { Route, Routes, useNavigate } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { RegisterResponse } from '@/types/auth';
import type { RegisterInput } from '@validations/auth.validations';
import { getAccessToken } from '@lib/auth-token';
import RegisterPage from '@pages/RegisterPage';
import { useAuthStore } from '@stores/auth.store';
import { server } from '@/test/mocks/server';
import { renderWithProviders } from '@/test/utils/render-with-providers';

const registerUrl = `${import.meta.env.VITE_API_URL}/auth/register`;
const registration: RegisterInput = {
  name: 'Rizal',
  email: 'rizal@example.com',
  password: 'password123',
};
const registerResponse: RegisterResponse = {
  success: true,
  message: 'Registration successful',
  data: {
    id: 'user-1',
    name: registration.name,
    email: registration.email,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
};

function mockRegistration() {
  const registerRequest = vi.fn(() =>
    HttpResponse.json(registerResponse, { status: 201 }),
  );
  server.use(http.post(registerUrl, registerRequest));
  return registerRequest;
}

function LoginDestination() {
  const navigate = useNavigate();
  return (
    <>
      <h1>Log in</h1>
      <button onClick={() => navigate(-1)}>Go back</button>
    </>
  );
}

function renderRegisterPage(initialEntries = ['/register']) {
  const user = userEvent.setup();
  renderWithProviders(
    <Routes>
      <Route path='/' element={<h1>Home</h1>} />
      <Route path='/register' element={<RegisterPage />} />
      <Route path='/login' element={<LoginDestination />} />
    </Routes>,
    { initialEntries },
  );
  return user;
}

async function submitRegistration(
  user: ReturnType<typeof userEvent.setup>,
  values: RegisterInput = registration,
) {
  if (values.name) await user.type(screen.getByLabelText(/full name/i), values.name);
  if (values.email) await user.type(screen.getByLabelText(/email address/i), values.email);
  if (values.password) await user.type(screen.getByLabelText(/^password$/i), values.password);
  await user.click(screen.getByRole('button', { name: /^create account$/i }));
}

function expectUnauthenticated() {
  expect(getAccessToken()).toBeNull();
  expect(useAuthStore.getState().status).toBe('unauthenticated');
  expect(useAuthStore.getState().user).toBeNull();
}

describe('RegisterPage', () => {
  beforeEach(() => {
    useAuthStore.getState().setUnauthenticated();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('submits a trimmed name and replaces the register route with login without authenticating', async () => {
    const receivedRegistration = vi.fn();
    server.use(
      http.post(registerUrl, async ({ request }) => {
        receivedRegistration(await request.json());
        return HttpResponse.json(registerResponse, { status: 201 });
      }),
    );

    const user = renderRegisterPage(['/', '/register']);
    await submitRegistration(user, { ...registration, name: '  Rizal  ' });

    expect(await screen.findByRole('heading', { name: 'Log in' })).toBeVisible();
    expect(receivedRegistration).toHaveBeenCalledExactlyOnceWith(registration);
    expectUnauthenticated();
    await user.click(screen.getByRole('button', { name: 'Go back' }));
    expect(await screen.findByRole('heading', { name: 'Home' })).toBeVisible();
  });

  it.each([
    {
      name: 'empty fields',
      values: { name: '', email: '', password: '' },
      errors: [
        { label: 'Full name', message: 'Name must be at least 2 characters' },
        { label: 'Email address', message: 'Please enter a valid email address' },
        { label: 'Password', message: 'Password must be at least 8 characters' },
      ],
    },
    {
      name: 'a one-character name',
      values: { ...registration, name: 'R' },
      errors: [{ label: 'Full name', message: 'Name must be at least 2 characters' }],
    },
    {
      name: 'a whitespace-only name',
      values: { ...registration, name: '   ' },
      errors: [{ label: 'Full name', message: 'Name must be at least 2 characters' }],
    },
    {
      name: 'a name longer than 100 characters',
      values: { ...registration, name: 'R'.repeat(101) },
      errors: [{ label: 'Full name', message: 'Name must be at most 100 characters' }],
    },
    {
      name: 'an invalid email',
      values: { ...registration, email: 'invalid-email' },
      errors: [{ label: 'Email address', message: 'Please enter a valid email address' }],
    },
    {
      name: 'a password shorter than 8 characters',
      values: { ...registration, password: '1234567' },
      errors: [{ label: 'Password', message: 'Password must be at least 8 characters' }],
    },
  ])('rejects $name without making a registration request', async ({ values, errors }) => {
    const registerRequest = mockRegistration();
    const user = renderRegisterPage();
    await submitRegistration(user, values);

    for (const { label, message } of errors) {
      expect(await screen.findByText(message)).toBeVisible();
      expect(screen.getByLabelText(label)).toBeInvalid();
      expect(screen.getByLabelText(label)).toHaveAccessibleDescription(message);
    }
    expect(registerRequest).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /^create account$/i })).toBeEnabled();
    expectUnauthenticated();
  });

  it.each([
    { status: 409, message: 'An account with this email already exists' },
    { status: 500, message: 'Unable to create an account. Please try again.' },
  ])('displays the HTTP $status error inline and allows a successful retry', async ({ status, message }) => {
    // The page logs expected API errors; keep this scenario's output quiet.
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const registerRequest = vi.fn()
      .mockImplementationOnce(() => HttpResponse.json({ success: false, message }, { status }))
      .mockImplementation(() => HttpResponse.json(registerResponse, { status: 201 }));
    server.use(http.post(registerUrl, registerRequest));

    const user = renderRegisterPage();
    await submitRegistration(user);

    expect(await screen.findByRole('alert')).toHaveTextContent(message);
    expect(screen.getByRole('alert')).toBeVisible();
    expect(screen.getByRole('button', { name: /^create account$/i })).toBeEnabled();
    expect(screen.getByLabelText(/full name/i)).toHaveValue(registration.name);
    expect(screen.getByLabelText(/email address/i)).toHaveValue(registration.email);
    expect(screen.getByLabelText(/^password$/i)).toHaveValue(registration.password);
    expect(screen.queryByRole('heading', { name: 'Log in' })).not.toBeInTheDocument();
    expectUnauthenticated();

    await user.click(screen.getByRole('button', { name: /^create account$/i }));
    expect(await screen.findByRole('heading', { name: 'Log in' })).toBeVisible();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(registerRequest).toHaveBeenCalledTimes(2);
    expectUnauthenticated();
  });

  it('shows a network error and keeps the form available', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const registerRequest = vi.fn(() => HttpResponse.error());
    server.use(http.post(registerUrl, registerRequest));

    const user = renderRegisterPage();
    await submitRegistration(user);

    expect(await screen.findByRole('alert')).toHaveTextContent('Network Error');
    expect(screen.getByRole('button', { name: /^create account$/i })).toBeEnabled();
    expect(screen.queryByRole('heading', { name: 'Log in' })).not.toBeInTheDocument();
    expect(registerRequest).toHaveBeenCalledTimes(1);
    expectUnauthenticated();
  });

  it('disables submission while creating the account and prevents duplicate requests', async () => {
    let finishRequest!: () => void;
    const pendingResponse = new Promise<void>((resolve) => {
      finishRequest = resolve;
    });
    const registerRequest = vi.fn(async () => {
      await pendingResponse;
      return HttpResponse.json(registerResponse, { status: 201 });
    });
    server.use(http.post(registerUrl, registerRequest));

    const user = renderRegisterPage();
    try {
      await submitRegistration(user);
      const button = await screen.findByRole('button', { name: /creating account/i });
      expect(button).toBeDisabled();
      await user.click(button);
      await waitFor(() => expect(registerRequest).toHaveBeenCalledTimes(1));
      expect(screen.queryByRole('heading', { name: 'Log in' })).not.toBeInTheDocument();
      expectUnauthenticated();
    } finally {
      finishRequest();
    }

    expect(await screen.findByRole('heading', { name: 'Log in' })).toBeVisible();
    expect(registerRequest).toHaveBeenCalledTimes(1);
  });

  it('navigates to login through the existing-account link without registering', async () => {
    const registerRequest = mockRegistration();
    const user = renderRegisterPage();

    await user.click(screen.getByRole('link', { name: /^log in$/i }));

    expect(await screen.findByRole('heading', { name: 'Log in' })).toBeVisible();
    expect(registerRequest).not.toHaveBeenCalled();
    expectUnauthenticated();
  });
});
