import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { getApplicationById, updateApplication } from '@api/application.api';
import {
  applicationFormSchema,
  type ApplicationFormInput,
} from '@validations/application.validations';
import type { UpdateApplicationInput } from '@/types/application';
import ApplicationForm from '@components/application/ApplicationForm';
import {
  applicationFormDefaultValues,
  applicationToFormValues,
  formToUpdateApplication,
} from '@utils/application-form';
import { queryKeys } from '@lib/query-keys';
import { getApiErrorMessage } from '@utils/get-api-error.message';
import {
  BackLink,
  ErrorState,
  PageHeading,
  PageSkeleton,
} from '@/components/workspace';

const EditApplicationPage = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const applicationQuery = useQuery({
    queryKey: queryKeys.applications.detail(id!),
    queryFn: () => getApplicationById(id!),
    enabled: Boolean(id),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ApplicationFormInput>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: applicationFormDefaultValues,
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateApplicationInput) => updateApplication(id!, data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.applications.detail(id!),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.applications.all,
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.dashboard,
        }),
      ]);

      navigate(`/applications/${id}`);
      toast.success('Application updated successfully.');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update application.'));
    },
  });

  const onSubmit = (data: ApplicationFormInput) => {
    updateMutation.mutate(formToUpdateApplication(data));
  };

  useEffect(() => {
    const application = applicationQuery.data?.data;

    if (!application) {
      return;
    }

    reset(applicationToFormValues(application));
  }, [applicationQuery.data, reset]);

  if (!id) {
    return <ErrorState message='This application link is invalid.' />;
  }

  if (applicationQuery.isPending) {
    return <PageSkeleton />;
  }

  if (applicationQuery.isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(
          applicationQuery.error,
          'Failed to load application.',
        )}
        retry={() => void applicationQuery.refetch()}
      />
    );
  }

  return (
    <div className='form-page'>
      <BackLink to={`/applications/${id}`}>Back to application</BackLink>
      <PageHeading
        title='Keep your next move up to date'
        description='Update the details, track a new stage, or capture something worth remembering.'
      />

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <ApplicationForm
          register={register}
          errors={errors}
          isPending={updateMutation.isPending}
          submitLabel='Save changes'
          cancelTo={`/applications/${id}`}
        />
      </form>
    </div>
  );
};

export default EditApplicationPage;
