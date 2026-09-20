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
