import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { toast } from 'sonner';
import { afterAll, afterEach, beforeAll } from 'vitest';

import { clearAccessToken } from '@lib/auth-token';
import { useAuthStore } from '@stores/auth.store';
import { server } from './mocks/server';

beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'error',
  });
});

afterEach(() => {
  cleanup();
  toast.dismiss();
  server.resetHandlers();
  clearAccessToken();
  useAuthStore.setState(useAuthStore.getInitialState());
});

afterAll(() => {
  server.close();
});
