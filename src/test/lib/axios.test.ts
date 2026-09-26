import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { api } from '@lib/api';
import { setupAxiosInterceptors } from '@lib/axios';
import { clearAccessToken, getAccessToken, setAccessToken } from '@lib/auth-token';
import * as refreshToken from '@lib/refresh-token';
import { useAuthStore } from '@stores/auth.store';
import { loginResponse } from '@/test/mocks/handlers';
import { server } from '@/test/mocks/server';

const apiUrl = import.meta.env.VITE_API_URL;
const refreshedToken = 'refreshed-access-token';
const refreshResponse = {
  success: true,
  message: 'Token refreshed',
  data: { accessToken: refreshedToken },
};

function unauthorized() {
  return HttpResponse.json(
    { success: false, message: 'Session expired' },
    { status: 401 },
  );
}

function mockRefresh() {
  const refreshRequest = vi.fn(() => HttpResponse.json(refreshResponse));
  server.use(http.post(`${apiUrl}/auth/refresh`, refreshRequest));
  return refreshRequest;
}

beforeEach(() => {
  // These instances are shared within this suite. Avoid accumulating interceptors.
  api.interceptors.request.clear();
  api.interceptors.response.clear();
  setupAxiosInterceptors();
  setAccessToken('expired-access-token');
  useAuthStore.getState().setAuthenticated(loginResponse.data.user);
});

afterEach(() => {
  api.interceptors.request.clear();
  api.interceptors.response.clear();
  vi.restoreAllMocks();
});

describe('Axios automatic token refresh', () => {
  it.each([
    { token: 'current-access-token', authorization: 'Bearer current-access-token' },
    { token: null, authorization: null },
  ])('sends the expected Authorization header when the token is $token', async ({ token, authorization }) => {
    const refreshRequest = mockRefresh();
    if (token) setAccessToken(token);
    else clearAccessToken();
    const receivedHeader = vi.fn();
    server.use(
      http.get(`${apiUrl}/profile`, ({ request }) => {
        receivedHeader(request.headers.get('Authorization'));
        return HttpResponse.json({ success: true });
      }),
    );

    await expect(api.get('/profile')).resolves.toMatchObject({ status: 200 });

    expect(receivedHeader).toHaveBeenCalledExactlyOnceWith(authorization);
    expect(refreshRequest).not.toHaveBeenCalled();
  });

  it('refreshes on 401 and retries with the new token, original method, body, query, and custom headers', async () => {
    const refreshRequest = mockRefresh();
    const receivedRequest = vi.fn();
    const payload = { name: 'Updated name' };
    server.use(
      http.patch(`${apiUrl}/profile`, async ({ request }) => {
        const authorization = request.headers.get('Authorization');
        receivedRequest({
          authorization,
          body: await request.json(),
          source: new URL(request.url).searchParams.get('source'),
          requestId: request.headers.get('X-Request-Id'),
        });
        if (authorization !== `Bearer ${refreshedToken}`) return unauthorized();
        return HttpResponse.json({ success: true, data: payload });
      }),
    );

    const response = await api.patch('/profile', payload, {
      params: { source: 'settings' },
      headers: { 'X-Request-Id': 'request-1' },
    });

    expect(response.data).toEqual({ success: true, data: payload });
    expect(receivedRequest.mock.calls).toEqual([
      [{ authorization: 'Bearer expired-access-token', body: payload, source: 'settings', requestId: 'request-1' }],
      [{ authorization: `Bearer ${refreshedToken}`, body: payload, source: 'settings', requestId: 'request-1' }],
    ]);
    expect(refreshRequest).toHaveBeenCalledTimes(1);
    expect(getAccessToken()).toBe(refreshedToken);
    expect(useAuthStore.getState().status).toBe('authenticated');
    expect(useAuthStore.getState().user).toEqual(loginResponse.data.user);
  });

  it.each([400, 403, 500])('passes through HTTP %s without refreshing or logging out', async (status) => {
    const refreshRequest = mockRefresh();
    const profileRequest = vi.fn(() =>
      HttpResponse.json({ message: 'Request failed' }, { status }),
    );
    server.use(http.get(`${apiUrl}/profile`, profileRequest));

    await expect(api.get('/profile')).rejects.toMatchObject({
      response: { status, data: { message: 'Request failed' } },
    });

    expect(profileRequest).toHaveBeenCalledTimes(1);
    expect(refreshRequest).not.toHaveBeenCalled();
    expect(getAccessToken()).toBe('expired-access-token');
    expect(useAuthStore.getState().status).toBe('authenticated');
  });

  it('passes through network failures without attempting a refresh', async () => {
    const refreshRequest = mockRefresh();
    const profileRequest = vi.fn(() => HttpResponse.error());
    server.use(http.get(`${apiUrl}/profile`, profileRequest));

    await expect(api.get('/profile')).rejects.toMatchObject({ code: 'ERR_NETWORK' });

    expect(profileRequest).toHaveBeenCalledTimes(1);
    expect(refreshRequest).not.toHaveBeenCalled();
    expect(getAccessToken()).toBe('expired-access-token');
    expect(useAuthStore.getState().status).toBe('authenticated');
  });

  it('rejects a repeated 401 after one retry instead of starting a refresh loop', async () => {
    // A second refresh fails too, bounding requests if the retry guard regresses.
    const refreshRequest = vi.fn()
      .mockImplementationOnce(() => HttpResponse.json(refreshResponse))
      .mockImplementation(() => unauthorized());
    const profileRequest = vi.fn(() => unauthorized());
    server.use(
      http.post(`${apiUrl}/auth/refresh`, refreshRequest),
      http.get(`${apiUrl}/profile`, profileRequest),
    );

    await expect(api.get('/profile')).rejects.toMatchObject({ response: { status: 401 } });

    expect(profileRequest).toHaveBeenCalledTimes(2);
    expect(refreshRequest).toHaveBeenCalledTimes(1);
  });

  it.each([401, 500, 'network'] as const)('clears authentication when refresh fails with %s', async (failure) => {
    const refreshRequest = vi.fn(() => failure === 'network'
      ? HttpResponse.error()
      : HttpResponse.json({ message: 'Refresh failed' }, { status: failure }),
    );
    const profileRequest = vi.fn(() => unauthorized());
    server.use(
      http.post(`${apiUrl}/auth/refresh`, refreshRequest),
      http.get(`${apiUrl}/profile`, profileRequest),
    );

    await expect(api.get('/profile')).rejects.toMatchObject(
      failure === 'network'
        ? { code: 'ERR_NETWORK' }
        : { response: { status: failure, data: { message: 'Refresh failed' } } },
    );

    expect(profileRequest).toHaveBeenCalledTimes(1);
    expect(refreshRequest).toHaveBeenCalledTimes(1);
    expect(getAccessToken()).toBeNull();
    expect(useAuthStore.getState().status).toBe('unauthenticated');
    expect(useAuthStore.getState().user).toBeNull();
  });

  it.each(['succeeds', 'fails'] as const)(
    'shares one refresh between concurrent 401s when it %s, then permits a later refresh',
    async (outcome) => {
      // Observe calls without replacing the helper: both requests must join it
      // before releasing MSW's response, avoiding races or timed sleeps.
      const refreshCalls = vi.spyOn(refreshToken, 'refreshAccessTokenOnce');
      let releaseRefresh!: () => void;
      const pendingRefresh = new Promise<void>((resolve) => {
        releaseRefresh = resolve;
      });
      const refreshRequest = vi.fn()
        .mockImplementationOnce(async () => {
          await pendingRefresh;
          return outcome === 'succeeds'
            ? HttpResponse.json(refreshResponse)
            : unauthorized();
        })
        .mockImplementation(() => HttpResponse.json(refreshResponse));
      const receivedRequest = vi.fn();
      server.use(
        http.post(`${apiUrl}/auth/refresh`, refreshRequest),
        http.get(`${apiUrl}/profile`, ({ request }) => {
          const authorization = request.headers.get('Authorization');
          const id = new URL(request.url).searchParams.get('id');
          receivedRequest(id, authorization);
          if (authorization !== `Bearer ${refreshedToken}`) return unauthorized();
          return HttpResponse.json({ id });
        }),
      );

      // Attach rejection handlers immediately so failure of either request is handled.
      const results = Promise.allSettled([
        api.get('/profile', { params: { id: 'first' } }),
        api.get('/profile', { params: { id: 'second' } }),
      ]);
      try {
        await vi.waitFor(() => expect(refreshCalls).toHaveBeenCalledTimes(2));
        await vi.waitFor(() => expect(refreshRequest).toHaveBeenCalledTimes(1));
        expect(receivedRequest).toHaveBeenCalledTimes(2);
      } finally {
        releaseRefresh();
        await results;
      }

      const settled = await results;
      if (outcome === 'succeeds') {
        expect(settled).toMatchObject([
          { status: 'fulfilled', value: { data: { id: 'first' } } },
          { status: 'fulfilled', value: { data: { id: 'second' } } },
        ]);
        expect(receivedRequest).toHaveBeenCalledTimes(4);
        expect(receivedRequest).toHaveBeenCalledWith('first', `Bearer ${refreshedToken}`);
        expect(receivedRequest).toHaveBeenCalledWith('second', `Bearer ${refreshedToken}`);
        expect(getAccessToken()).toBe(refreshedToken);
        expect(useAuthStore.getState().status).toBe('authenticated');
      } else {
        expect(settled).toMatchObject([
          { status: 'rejected', reason: { response: { status: 401 } } },
          { status: 'rejected', reason: { response: { status: 401 } } },
        ]);
        expect(receivedRequest).toHaveBeenCalledTimes(2);
        expect(getAccessToken()).toBeNull();
        expect(useAuthStore.getState().status).toBe('unauthenticated');
        expect(useAuthStore.getState().user).toBeNull();
      }
      expect(refreshRequest).toHaveBeenCalledTimes(1);

      // A settled refresh promise must not be reused during a later session.
      setAccessToken('expired-again');
      useAuthStore.getState().setAuthenticated(loginResponse.data.user);
      await expect(api.get('/profile', { params: { id: 'later' } })).resolves.toMatchObject({
        data: { id: 'later' },
      });
      expect(refreshRequest).toHaveBeenCalledTimes(2);
      expect(getAccessToken()).toBe(refreshedToken);
      expect(useAuthStore.getState().status).toBe('authenticated');
    },
  );
});
