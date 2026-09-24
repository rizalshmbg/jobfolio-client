import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  applicationFormSchema,
  type ApplicationFormInput,
} from '@validations/application.validations';
import type { CreateApplicationInput } from '@/types/application';
import { createApplication } from '@api/application.api';
import { useNavigate } from 'react-router';
import ApplicationForm from '@components/application/ApplicationForm';

const CreateApplicationPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplicationFormInput>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      company: '',
      position: '',
      status: 'APPLIED',
      appliedAt: '',
      jobUrl: '',
      location: '',
      employmentType: '',
      workArrangement: '',
      salaryMin: '',
      salaryMax: '',
      notes: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: createApplication,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['applications'],
        }),

        queryClient.invalidateQueries({
          queryKey: ['dashboard'],
        }),
      ]);

      navigate('/applications');
    },
  });

  const onSubmit = (data: ApplicationFormInput) => {
    const payload: CreateApplicationInput = {
      company: data.company,
      position: data.position,
      status: data.status,

      ...(data.appliedAt && {
        appliedAt: data.appliedAt,
      }),

      ...(data.jobUrl && {
        jobUrl: data.jobUrl,
      }),

      ...(data.location && {
        location: data.location,
      }),

      ...(data.employmentType && {
        employmentType: data.employmentType,
      }),

      ...(data.workArrangement && {
        workArrangement: data.workArrangement,
      }),

      ...(data.salaryMin && {
        salaryMin: Number(data.salaryMin),
      }),

      ...(data.salaryMax && {
        salaryMax: Number(data.salaryMax),
      }),

      ...(data.notes && {
        notes: data.notes,
      }),
    };

    createMutation.mutate(payload);
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
