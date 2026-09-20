import { useEffect } from 'react';

import { getProfile } from '@api/profile.api';
import { clearAccessToken, setAccessToken } from '@lib/auth-token';
import { useAuthStore } from '@stores/auth.store';
import { refreshAccessToken } from '@api/auth.api';

export const useAuthInitialization = () => {
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);

  const setUnauthenticated = useAuthStore((state) => state.setUnauthenticated);

  useEffect(() => {
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
  }, [setAuthenticated, setUnauthenticated]);
};
