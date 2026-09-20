import { refreshAccessToken } from '@api/auth.api';
import { clearAccessToken, setAccessToken } from '@lib/auth-token';

let refreshPromise: Promise<string> | null = null;

export const refreshAccessTokenOnce = (): Promise<string> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = refreshAccessToken()
    .then((response) => {
      const accessToken = response.data.accessToken;

      setAccessToken(accessToken);

      return accessToken;
    })
    .catch((error: unknown) => {
      clearAccessToken();

      throw error;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};
