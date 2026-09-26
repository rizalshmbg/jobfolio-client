import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router';
import { ArrowRight, LoaderCircle } from 'lucide-react';
import AuthLayout from '@layouts/AuthLayout';
import { Field } from '@/components/workspace';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import {
  registerSchema,
  type RegisterInput,
} from '@validations/auth.validations';
import { register as registerUser } from '@api/auth.api';
import { getApiErrorMessage } from '@utils/get-api-error.message';

const RegisterPage = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      navigate('/login', { replace: true });
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const onSubmit = (data: RegisterInput) => {
    registerMutation.mutate(data);
  };

  return (
    <AuthLayout
      title='A fresh start awaits.'
      description='Create your personal workspace. Every application, every stage, and every step forward—all together.'
    >
      {registerMutation.isError && (
        <p className='notice notice-error' role='alert'>
          {getApiErrorMessage(registerMutation.error, 'Failed to register.')}
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-5' noValidate>
        <Field id='name' label='Full name' error={errors.name?.message}>
          <Input
            id='name'
            autoComplete='name'
            placeholder='Your name'
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
            {...register('name')}
          />
        </Field>
        <Field id='email' label='Email address' error={errors.email?.message}>
          <Input
            id='email'
            type='email'
            autoComplete='email'
            placeholder='you@example.com'
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            {...register('email')}
          />
        </Field>
        <Field id='password' label='Password' error={errors.password?.message}>
          <Input
            id='password'
            type='password'
            autoComplete='new-password'
            placeholder='Create a password'
            aria-invalid={!!errors.password}
            aria-describedby={
              errors.password ? 'password-error' : 'password-hint'
            }
            {...register('password')}
          />
          <p id='password-hint' className='text-xs text-muted-foreground'>
            Use at least 8 characters.
          </p>
        </Field>
        <Button
          type='submit'
          disabled={registerMutation.isPending}
          className='w-full h-11'
        >
          {registerMutation.isPending ? (
            <>
              <LoaderCircle className='animate-spin' />
              Creating account...
            </>
          ) : (
            <>
              Create account
              <ArrowRight />
            </>
          )}
        </Button>
      </form>
      <p className='mt-7 text-center text-sm text-muted-foreground'>
        Already have an account?{' '}
        <Link
          className='font-semibold text-primary hover:underline'
          to='/login'
        >
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
};
export default RegisterPage;
