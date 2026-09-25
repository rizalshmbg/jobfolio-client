import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  applicationFormSchema,
  type ApplicationFormInput,
} from '@validations/application.validations';
import { createApplication } from '@api/application.api';
import { useNavigate } from 'react-router';
import ApplicationForm from '@components/application/ApplicationForm';
import {
  applicationFormDefaultValues,
  formToCreateApplication,
} from '@utils/application-form';
import { queryKeys } from '@lib/query-keys';

const CreateApplicationPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplicationFormInput>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: applicationFormDefaultValues,
  });

  const createMutation = useMutation({
    mutationFn: createApplication,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.applications.all,
        }),

        queryClient.invalidateQueries({
          queryKey: queryKeys.dashboard,
        }),
      ]);

      navigate('/applications');
    },
  });

  const onSubmit = (data: ApplicationFormInput) => {
    createMutation.mutate(formToCreateApplication(data));
  };

  return (
    <main>
      <h1>CreateApplicationPage</h1>

      {createMutation.isError && <p>Failed to create application.</p>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <ApplicationForm
          register={register}
          errors={errors}
          isPending={createMutation.isPending}
          submitLabel='Create Application'
        />
      </form>
    </main>
  );
};
export default CreateApplicationPage;
