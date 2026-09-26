import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

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
import { getApiErrorMessage } from '@utils/get-api-error.message';
import { BackLink, PageHeading } from '@/components/workspace';

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
      toast.success('Application added successfully.');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to create application.'));
    },
  });

  const onSubmit = (data: ApplicationFormInput) => {
    createMutation.mutate(formToCreateApplication(data));
  };

  return (
    <div className='form-page'>
      <BackLink />
      <PageHeading
        title='A new opportunity'
        description='Add an application to your tracker. The next chapter starts with a small step.'
      />

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <ApplicationForm
          register={register}
          errors={errors}
          isPending={createMutation.isPending}
          submitLabel='Add application'
        />
      </form>
    </div>
  );
};
export default CreateApplicationPage;
