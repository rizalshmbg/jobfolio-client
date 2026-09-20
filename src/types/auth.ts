export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export type LoginResponse = {
  success: boolean;
  message: string;
  data: {
    user: AuthUser;
    accessToken: string;
  };
};

export type RegisterResponse = {
  success: boolean;
  message: string;
  data: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    updatedAt: string;
  };
};

export type RefreshResponse = {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
  };
};

export type LogoutResponse = {
  success: boolean;
  message: string;
};
