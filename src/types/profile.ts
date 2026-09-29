export type Profile = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

export type ProfileResponse = {
  success: boolean;
  message: string;
  data: Profile;
};

export type UpdateProfileInput = {
  name?: string;
};

export type ChangePasswordResponse = {
  success: boolean;
  message: string;
}

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};
