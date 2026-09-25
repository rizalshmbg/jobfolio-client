import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';

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
    <main>
      <h1>Register</h1>

      {registerMutation.isError && (
        <p>
          {getApiErrorMessage(registerMutation.error, 'Failed to register.')}
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor='name'>Name</label>
          <input id='name' type='text' {...register('name')} />
          {errors.name && <p>{errors.name.message}</p>}
        </div>

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

        <button type='submit' disabled={registerMutation.isPending}>
          {registerMutation.isPending ? 'Creating account' : 'Register'}
        </button>
      </form>
    </main>
  );
};
export default RegisterPage;
