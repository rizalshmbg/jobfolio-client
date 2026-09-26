import { http, HttpResponse } from 'msw';

import type { LoginResponse } from '@/types/auth';

export const loginUrl = `${import.meta.env.VITE_API_URL}/auth/login`;

export const loginResponse: LoginResponse = {
  success: true,
  message: 'Login successful',
  data: {
    user: {
      id: 'user-1',
      name: 'Rizal',
      email: 'rizal@example.com',
    },
    accessToken: 'test-access-token',
  },
};

export const handlers = [
  http.post(loginUrl, () => {
    return HttpResponse.json(loginResponse);
  }),
];
