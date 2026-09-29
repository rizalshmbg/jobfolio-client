import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router';
import { ArrowRight, Eye, EyeOff, LoaderCircle } from 'lucide-react';
import AuthLayout from '@layouts/AuthLayout';
import { Field } from '@/components/workspace';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import type { LoginInput } from '@validations/auth.validations';
import { loginSchema } from '@validations/auth.validations';
import { login } from '@api/auth.api';
import { setAccessToken } from '@lib/auth-token';
import { useAuthStore } from '@stores/auth.store';
import { getApiErrorMessage } from '@utils/get-api-error.message';

const LoginPage = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState<boolean>(false);

  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      setAccessToken(response.data.accessToken);
      setAuthenticated(response.data.user);
      navigate('/dashboard', {
        replace: true,
      });
      toast.success('You’re logged in. Welcome back!');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to log in.'));
    },
  });

  const onSubmit = (data: LoginInput) => {
    loginMutation.mutate(data);
  };

  return (
    <AuthLayout
      title='Welcome back.'
      description='Your applications, your progress, your next move. Pick up right where you left off.'
    >
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-5' noValidate>
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
          <div className='relative'>
            <Input
              id='password'
              type={showPassword ? 'text' : 'password'}
              autoComplete='current-password'
              placeholder='Enter your password'
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              {...register('password')}
            />

            <button
              type='button'
              onClick={() => setShowPassword((value) => !value)}
              className='absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-primary'
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>
        <Button
          type='submit'
          disabled={loginMutation.isPending}
          className='w-full h-11'
        >
          {loginMutation.isPending ? (
            <>
              <LoaderCircle className='animate-spin' />
              Logging in...
            </>
          ) : (
            <>
              Log in
              <ArrowRight />
            </>
          )}
        </Button>
      </form>
      <p className='mt-7 text-center text-sm text-muted-foreground'>
        New to JobFolio?{' '}
        <Link
          className='font-semibold text-primary hover:underline'
          to='/register'
        >
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
};
export default LoginPage;
