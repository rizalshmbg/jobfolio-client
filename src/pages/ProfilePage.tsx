import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
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
import { CalendarDays, LoaderCircle, Save, UserRound } from 'lucide-react';
import {
  ErrorState,
  Field,
  PageHeading,
  PageSkeleton,
} from '@/components/workspace';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatDate } from '@utils/format-date';

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
      toast.success('Profile updated successfully.');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update profile.'));
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
    return <PageSkeleton />;
  }

  if (profileQuery.isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(
          profileQuery.error,
          'Failed to load profile.',
        )}
        retry={() => void profileQuery.refetch()}
      />
    );
  }

  const profile = profileQuery.data.data;

  return (
    <div className='page-stack'>
      <PageHeading
        eyebrow='MAKE YOURSELF AT HOME'
        title='Your profile'
        description='A personal space for your professional next chapter.'
      />

      <div className='profile-grid'>
        <section className='panel profile-card'>
          <span className='profile-avatar'>
            {profile.name.slice(0, 1).toUpperCase()}
          </span>
          <h2>{profile.name}</h2>
          <p>{profile.email}</p>
          <div className='mt-7 border-t pt-5'>
            <span className='subtle-tag'>Personal workspace</span>
            <p className='mt-4! flex items-center justify-center gap-1.5 text-[10px]!'>
              <CalendarDays size={12} />
              Joined {formatDate(profile.createdAt)}
            </p>
          </div>
        </section>
        <section className='panel'>
          <div className='form-section-heading'>
            <span className='section-icon'>
              <UserRound size={19} />
            </span>
            <div>
              <h2>Personal details</h2>
              <p>Keep your profile feeling like you.</p>
            </div>
          </div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className='space-y-6 p-6'
            noValidate
          >
            <Field id='name' label='Full name' error={errors.name?.message}>
              <Input
                id='name'
                autoComplete='name'
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'name-error' : undefined}
                {...register('name')}
              />
            </Field>
            <Field id='email' label='Email address'>
              <Input id='email' type='email' value={profile.email} disabled />
              <p className='text-xs leading-5 text-muted-foreground'>
                Your email is linked to your account and cannot be changed here.
              </p>
            </Field>
            <div className='flex justify-end border-t pt-5'>
              <Button type='submit' disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <LoaderCircle className='animate-spin' />
                ) : (
                  <Save size={16} />
                )}
                {updateMutation.isPending ? 'Saving...' : 'Save changes'}
              </Button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;
