import { useEffect } from 'react';

import { refreshAccessToken } from '@api/auth.api';
import { getProfile } from '@api/profile.api';
import { clearAccessToken, setAccessToken } from '@lib/auth-token';
import { useAuthStore } from '@stores/auth.store';

export const useAuthInitialization = () => {
  const status = useAuthStore((state) => state.status);

  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);

  const setUnauthenticated = useAuthStore((state) => state.setUnauthenticated);

  useEffect(() => {
    if (status !== 'checking') {
      return;
    }

    const initializeAuth = async () => {
      try {
        const refreshResponse = await refreshAccessToken();
        setAccessToken(refreshResponse.data.accessToken);

        const profileResponse = await getProfile();
        setAuthenticated(profileResponse.data);
      } catch {
        clearAccessToken();
        setUnauthenticated();
      }
    };

    initializeAuth();
  }, [status, setAuthenticated, setUnauthenticated]);
};
