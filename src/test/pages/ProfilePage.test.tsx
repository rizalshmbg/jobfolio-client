import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Profile, ProfileResponse, UpdateProfileInput } from '@/types/profile';
import { Toaster } from '@/components/ui/sonner';
import { getAccessToken, setAccessToken } from '@lib/auth-token';
import { queryKeys } from '@lib/query-keys';
import ProfilePage from '@pages/ProfilePage';
import { useAuthStore } from '@stores/auth.store';
import { server } from '@/test/mocks/server';
import { deferredResponse } from '@/test/utils/application-tests';
import { renderWithProviders } from '@/test/utils/render-with-providers';

const profileUrl = `${import.meta.env.VITE_API_URL}/profile`;
const profile: Profile = {
  id: 'user-1',
  name: 'Rizal Sihombing',
  email: 'rizal@example.com',
  createdAt: '2026-09-01T12:00:00',
  updatedAt: '2026-09-20T12:00:00',
};
const authUser = { id: profile.id, name: profile.name, email: profile.email };

function profileResponse(data = profile): ProfileResponse {
  return { success: true, message: 'Profile retrieved', data };
}

function mockProfile() {
  let savedProfile = profile;
  const receivedBody = vi.fn();
  const getRequest = vi.fn(() => HttpResponse.json(profileResponse(savedProfile)));
  const patchRequest = vi.fn(async ({ request }: { request: Request }) => {
    const body = await request.json() as UpdateProfileInput;
    receivedBody(body);
    savedProfile = { ...savedProfile, ...body };
    return HttpResponse.json(profileResponse(savedProfile));
  });
  server.use(http.get(profileUrl, getRequest), http.patch(profileUrl, patchRequest));
  return { getRequest, patchRequest, receivedBody };
}

function renderProfile() {
  const user = userEvent.setup();
  const result = renderWithProviders(
    <><ProfilePage /><Toaster /></>,
    { initialEntries: ['/profile'] },
  );
  return { user, ...result };
}

async function changeName(user: ReturnType<typeof userEvent.setup>, name: string) {
  const input = screen.getByRole('textbox', { name: 'Full name' });
  await user.clear(input);
  if (name) {
    await user.click(input);
    await user.paste(name);
  }
  return input;
}

describe('ProfilePage', () => {
  beforeEach(() => {
    useAuthStore.getState().setAuthenticated(authUser);
    setAccessToken('profile-access-token');
  });

  it('shows loading before displaying the profile card and prefilling the form', async () => {
    const pending = deferredResponse();
    const getRequest = vi.fn(async () => {
      await pending.promise;
      return HttpResponse.json(profileResponse());
    });
    server.use(http.get(profileUrl, getRequest));
    renderProfile();
    try {
      expect(screen.getByRole('status', { name: 'Loading page' })).toBeVisible();
      expect(screen.queryByRole('button', { name: 'Save changes' })).not.toBeInTheDocument();
      await waitFor(() => expect(getRequest).toHaveBeenCalledTimes(1));
    } finally {
      pending.resolve();
      await screen.findByDisplayValue(profile.name);
    }
    expect(screen.getByRole('heading', { name: 'Your profile' })).toBeVisible();
    expect(screen.getByRole('heading', { name: profile.name })).toBeVisible();
    expect(screen.getByText(profile.email)).toBeVisible();
    expect(screen.getByText('Joined 01/09/2026')).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Email address' })).toHaveValue(profile.email);
    expect(screen.queryByRole('status', { name: 'Loading page' })).not.toBeInTheDocument();
  });

  it('keeps the email address disabled and excludes it from update requests', async () => {
    const { receivedBody } = mockProfile();
    const { user } = renderProfile();
    await screen.findByDisplayValue(profile.name);
    const email = screen.getByRole('textbox', { name: 'Email address' });
    expect(email).toBeDisabled();
    expect(screen.getByText('Your email is linked to your account and cannot be changed here.')).toBeVisible();
    await user.type(email, 'another@example.com');
    expect(email).toHaveValue(profile.email);
    await changeName(user, 'Updated name');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    await screen.findByText('Profile updated successfully.');
    expect(receivedBody).toHaveBeenCalledExactlyOnceWith({ name: 'Updated name' });
    expect(useAuthStore.getState().user?.email).toBe(profile.email);
  });

  it('submits a trimmed name, uses the server-returned name in auth state, and refetches the profile', async () => {
    const updatedProfile = { ...profile, name: 'Rizal Updated', updatedAt: '2026-09-26T12:00:00' };
    const getRequest = vi.fn()
      .mockImplementationOnce(() => HttpResponse.json(profileResponse()))
      .mockImplementation(() => HttpResponse.json(profileResponse(updatedProfile)));
    const receivedBody = vi.fn();
    server.use(
      http.get(profileUrl, getRequest),
      http.patch(profileUrl, async ({ request }) => {
        receivedBody(await request.json());
        return HttpResponse.json(profileResponse(updatedProfile));
      }),
    );
    const { user, queryClient } = renderProfile();
    await screen.findByDisplayValue(profile.name);
    await changeName(user, '  rizal updated  ');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('Profile updated successfully.')).toBeVisible();
    expect(receivedBody).toHaveBeenCalledExactlyOnceWith({ name: 'rizal updated' });
    expect(await screen.findByRole('heading', { name: updatedProfile.name })).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Full name' })).toHaveValue(updatedProfile.name);
    expect(getRequest).toHaveBeenCalledTimes(2);
    expect(queryClient.getQueryData(queryKeys.profile)).toEqual(profileResponse(updatedProfile));
    expect(useAuthStore.getState().user).toEqual({ ...authUser, name: updatedProfile.name });
    expect(useAuthStore.getState().status).toBe('authenticated');
    expect(getAccessToken()).toBe('profile-access-token');
  });

  it.each([
    { scenario: 'empty', name: '', message: 'Name must be at least 2 characters' },
    { scenario: 'whitespace-only', name: '   ', message: 'Name must be at least 2 characters' },
    { scenario: 'one-character', name: 'R', message: 'Name must be at least 2 characters' },
    { scenario: 'overlong', name: 'R'.repeat(101), message: 'Name must not exceed 100 characters' },
  ])('rejects a $scenario name without saving or changing auth state', async ({ name, message }) => {
    const { patchRequest } = mockProfile();
    const { user } = renderProfile();
    await screen.findByDisplayValue(profile.name);
    const input = await changeName(user, name);
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(message);
    expect(input).toBeInvalid();
    expect(input).toHaveAccessibleDescription(message);
    expect(patchRequest).not.toHaveBeenCalled();
    expect(useAuthStore.getState().user).toEqual(authUser);
  });

  it.each([2, 100])('accepts a name at the %s-character boundary', async (length) => {
    const { receivedBody } = mockProfile();
    const { user } = renderProfile();
    await screen.findByDisplayValue(profile.name);
    const name = 'R'.repeat(length);
    await changeName(user, name);
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(await screen.findByText('Profile updated successfully.')).toBeVisible();
    expect(receivedBody).toHaveBeenCalledExactlyOnceWith({ name });
    expect(useAuthStore.getState().user?.name).toBe(name);
  });

  it.each([500, 'network'] as const)('shows a %s loading error and reloads when Try again is clicked', async (failure) => {
    const message = failure === 'network' ? 'Network Error' : 'Profile unavailable';
    const getRequest = vi.fn()
      .mockImplementationOnce(() => failure === 'network' ? HttpResponse.error()
        : HttpResponse.json({ message }, { status: failure }))
      .mockImplementation(() => HttpResponse.json(profileResponse()));
    server.use(http.get(profileUrl, getRequest));
    const { user } = renderProfile();
    expect(await screen.findByRole('alert')).toHaveTextContent(message);
    expect(screen.queryByRole('button', { name: 'Save changes' })).not.toBeInTheDocument();
    expect(getRequest).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByDisplayValue(profile.name)).toBeVisible();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(getRequest).toHaveBeenCalledTimes(2);
  });

  it.each([500, 'network'] as const)('preserves the edited name, cached profile, and auth state on a %s save error and allows retry', async (failure) => {
    const { getRequest, patchRequest } = mockProfile();
    const message = failure === 'network' ? 'Network Error' : 'Profile could not be saved';
    patchRequest.mockImplementationOnce(async () => failure === 'network' ? HttpResponse.error()
      : HttpResponse.json({ message }, { status: failure }));
    const { user, queryClient } = renderProfile();
    await screen.findByDisplayValue(profile.name);
    await changeName(user, 'My revised name');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText(message)).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Full name' })).toHaveValue('My revised name');
    expect(screen.getByRole('heading', { name: profile.name })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeEnabled();
    expect(screen.queryByText('Profile updated successfully.')).not.toBeInTheDocument();
    expect(queryClient.getQueryData(queryKeys.profile)).toEqual(profileResponse());
    expect(getRequest).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().user).toEqual(authUser);
    expect(useAuthStore.getState().status).toBe('authenticated');
    expect(getAccessToken()).toBe('profile-access-token');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(await screen.findByText('Profile updated successfully.')).toBeVisible();
    expect(await screen.findByRole('heading', { name: 'My revised name' })).toBeVisible();
    expect(patchRequest).toHaveBeenCalledTimes(2);
    expect(getRequest).toHaveBeenCalledTimes(2);
    expect(useAuthStore.getState().user?.name).toBe('My revised name');
  });

  it('disables saving and prevents duplicate requests while the update is pending', async () => {
    const { getRequest, patchRequest } = mockProfile();
    const pending = deferredResponse();
    patchRequest.mockImplementationOnce(async () => {
      await pending.promise;
      return HttpResponse.json(profileResponse());
    });
    const { user } = renderProfile();
    await screen.findByDisplayValue(profile.name);
    try {
      await user.click(screen.getByRole('button', { name: 'Save changes' }));
      const saving = await screen.findByRole('button', { name: 'Saving...' });
      expect(saving).toBeDisabled();
      await user.click(saving);
      await waitFor(() => expect(patchRequest).toHaveBeenCalledTimes(1));
      expect(getRequest).toHaveBeenCalledTimes(1);
      expect(useAuthStore.getState().user).toEqual(authUser);
    } finally {
      pending.resolve();
      await screen.findByText('Profile updated successfully.');
    }
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeEnabled();
    expect(patchRequest).toHaveBeenCalledTimes(1);
    expect(getRequest).toHaveBeenCalledTimes(2);
  });
});
