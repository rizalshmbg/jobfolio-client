import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { getProfile, updateProfile } from '@api/profile.api';
import {
  profileFormSchema,
  type ProfileFormInput,
} from '@validations/profile.validations';
import { useAuthStore } from '@stores/auth.store';
import { queryKeys } from '@lib/query-keys';
import { getApiErrorMessage } from '@utils/get-api-error.message';

const ProfilePage = () => {
  const queryClient = useQueryClient();

  const updateUser = useAuthStore((state) => state.updateUser);

  const profileQuery = useQuery({
    queryKey: queryKeys.profile,
    queryFn: getProfile,
  });

  const updateMutation = useMutation({
    mutationFn: updateProfile,

    onSuccess: async (response) => {
      updateUser({ name: response.data.name });

      await queryClient.invalidateQueries({
        queryKey: queryKeys.profile,
      });
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormInput>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
    },
  });

  const onSubmit = (data: ProfileFormInput) => {
    updateMutation.mutate(data);
  };

  useEffect(() => {
    const profile = profileQuery.data?.data;

    if (!profile) {
      return;
    }

    reset({
      name: profile.name,
    });
  }, [profileQuery.data, reset]);

  if (profileQuery.isPending) {
    return <p>Loading profile...</p>;
  }

  if (profileQuery.isError) {
    return (
      <p>
        {getApiErrorMessage(
          profileQuery.error,
          'Failed to load profile.',
        )}
      </p>
    );
  }

  const profile = profileQuery.data.data;

  return (
    <main>
      <h1>ProfilePage</h1>

      {updateMutation.isError && (
        <p>
          {getApiErrorMessage(
            updateMutation.error,
            'Failed to update profile.',
          )}
        </p>
      )}

      {updateMutation.isSuccess && <p>Profile updated successfully.</p>}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor='name'>Name</label>
          <input id='name' type='text' {...register('name')} />

          {errors.name && <p>{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor='email'>Email</label>
          <input id='email' type='email' value={profile.email} disabled />
        </div>

        <button type='submit' disabled={updateMutation.isPending}>
          {updateMutation.isPending ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </main>
  );
};

export default ProfilePage;
