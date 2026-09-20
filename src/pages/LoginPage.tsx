import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';

import type { LoginInput } from '@validations/auth.validations';
import { loginSchema } from '@validations/auth.validations';
import { login } from '@api/auth.api';
import { setAccessToken } from '@lib/auth-token';
import { useAuthStore } from '@stores/auth.store';

const LoginPage = () => {
  const navigate = useNavigate();

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
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const onSubmit = (data: LoginInput) => {
    loginMutation.mutate(data);
  };

  return (
    <main>
      <h1>Login</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor='email'>Email</label>
          <input id='email' type='text' {...register('email')} />
          {errors.email && <p>{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor='password'>Password</label>
          <input id='password' type='password' {...register('password')} />
          {errors.password && <p>{errors.password.message}</p>}
        </div>

        <button type='submit' disabled={loginMutation.isPending}>
          {loginMutation.isPending ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </main>
  );
};
export default LoginPage;
