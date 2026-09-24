import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import { applicationFormDefaultValues, applicationToFormValues, formToUpdateApplication } from '@utils/application-form';

const EditApplicationPage = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const applicationQuery = useQuery({
    queryKey: ['application', id],
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
          queryKey: ['application', id],
        }),
        queryClient.invalidateQueries({
          queryKey: ['applications'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['dashboard'],
        }),
      ]);

      navigate(`/applications/${id}`);
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
    return <p>Invalid application ID.</p>;
  }

  if (applicationQuery.isPending) {
    return <p>Loading application...</p>;
  }

  if (applicationQuery.isError) {
    return <p>Failed to load application.</p>;
  }

  return (
    <main>
      <h1>EditApplicationPage</h1>

      {updateMutation.isError && <p>Failed to update application.</p>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <ApplicationForm
          register={register}
          errors={errors}
          isPending={updateMutation.isPending}
          submitLabel='Update Application'
        />
      </form>
    </main>
  );
};

export default EditApplicationPage;
