import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { getProfile, updateProfile, changePassword } from '@api/profile.api';
import {
  profileFormSchema,
  type ProfileFormInput,
  changePasswordFormSchema,
  type ChangePasswordFormInput,
} from '@validations/profile.validations';
import { useAuthStore } from '@stores/auth.store';
import { queryKeys } from '@lib/query-keys';
import { getApiErrorMessage } from '@utils/get-api-error.message';
import {
  CalendarDays,
  Eye,
  EyeOff,
  LoaderCircle,
  Save,
  UserRound,
  UserRoundKey,
} from 'lucide-react';
import { ErrorState } from '@/components/common/ErrorState';
import { Field } from '@/components/common/Field';
import { PageHeading } from '@/components/common/PageHeading';
import { PageSkeleton } from '@/components/common/PageSkeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatDate } from '@utils/format-date';

const ProfilePage = () => {
  const queryClient = useQueryClient();

  const updateUser = useAuthStore((state) => state.updateUser);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const changePasswordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success('Password changed successfully.');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to change password.'));
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

  const {
    register: registerChangePassword,
    handleSubmit: handleSubmitChangePassword,
    reset: resetPassword,
    formState: { errors: errorsChangePassword },
  } = useForm<ChangePasswordFormInput>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data: ProfileFormInput) => {
    updateMutation.mutate(data);
  };

  const onPasswordSubmit = (data: ChangePasswordFormInput) => {
    changePasswordMutation.mutate(data, {
      onSuccess: () => {
        resetPassword();
      },
    });
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

        <section />

        <section className='panel'>
          <div className='form-section-heading'>
            <span className='section-icon'>
              <UserRoundKey size={19} />
            </span>
            <div>
              <h2>Change password</h2>
              <p>Update your password to keep your account secure.</p>
            </div>
          </div>
          <form
            onSubmit={handleSubmitChangePassword(onPasswordSubmit)}
            className='space-y-6 p-6'
            noValidate
          >
            <Field
              id='currentPassword'
              label='Current password'
              error={errorsChangePassword.currentPassword?.message}
            >
              <div className='relative'>
                <Input
                  id='currentPassword'
                  type={showCurrentPassword ? 'text' : 'password'}
                  autoComplete='current-password'
                  aria-invalid={!!errorsChangePassword.currentPassword}
                  aria-describedby={
                    errorsChangePassword.currentPassword
                      ? 'currentPassword-error'
                      : undefined
                  }
                  {...registerChangePassword('currentPassword')}
                />

                <button
                  type='button'
                  onClick={() => setShowCurrentPassword((value) => !value)}
                  className='absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-primary'
                  aria-label={
                    showCurrentPassword
                      ? 'Hide current password'
                      : 'Show current password'
                  }
                >
                  {showCurrentPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
            </Field>
            <Field
              id='newPassword'
              label='New password'
              error={errorsChangePassword.newPassword?.message}
            >
              <div className='relative'>
                <Input
                  id='newPassword'
                  type={showNewPassword ? 'text' : 'password'}
                  autoComplete='new-password'
                  aria-invalid={!!errorsChangePassword.newPassword}
                  aria-describedby={
                    errorsChangePassword.newPassword
                      ? 'newPassword-error'
                      : undefined
                  }
                  {...registerChangePassword('newPassword')}
                />

                <button
                  type='button'
                  onClick={() => setShowNewPassword((value) => !value)}
                  className='absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-primary'
                  aria-label={
                    showNewPassword ? 'Hide new password' : 'Show new password'
                  }
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>
            <Field
              id='confirmPassword'
              label='Confirm new password'
              error={errorsChangePassword.confirmPassword?.message}
            >
              <div className='relative'>
                <Input
                  id='confirmPassword'
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete='new-password'
                  aria-invalid={!!errorsChangePassword.confirmPassword}
                  aria-describedby={
                    errorsChangePassword.confirmPassword
                      ? 'confirmPassword-error'
                      : undefined
                  }
                  {...registerChangePassword('confirmPassword')}
                />

                <button
                  type='button'
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  className='absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-primary'
                  aria-label={
                    showConfirmPassword
                      ? 'Hide confirm new password'
                      : 'Show confirm new password'
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
            </Field>
            <div className='flex justify-end border-t pt-5'>
              <Button
                variant='default'
                type='submit'
                disabled={changePasswordMutation.isPending}
              >
                {changePasswordMutation.isPending ? (
                  <LoaderCircle className='animate-spin' />
                ) : (
                  <Save size={16} />
                )}
                {changePasswordMutation.isPending
                  ? 'Changing...'
                  : 'Change password'}
              </Button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;
