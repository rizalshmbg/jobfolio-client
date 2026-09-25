import axios from 'axios';

type ApiErrorResponse = {
  success: false;
  message: string;
};

export const getApiErrorMessage = (
  error: unknown,
  fallbackMessage = 'Something went wrong',
): string => {
  if (
    axios.isAxiosError<ApiErrorResponse>(error) &&
    error.response?.data?.message
  ) {
    return error.response.data.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
};
