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
    const payload: UpdateApplicationInput = {
      company: data.company,
      position: data.position,
      status: data.status,
      appliedAt: data.appliedAt || null,
      jobUrl: data.jobUrl || null,
      location: data.location || null,
      employmentType: data.employmentType || null,
      workArrangement: data.workArrangement || null,
      salaryMin: data.salaryMin !== '' ? Number(data.salaryMin) : null,
      salaryMax: data.salaryMax !== '' ? Number(data.salaryMax) : null,
      notes: data.notes || null,
    };

    updateMutation.mutate(payload);
  };

  useEffect(() => {
    const application = applicationQuery.data?.data;

    if (!application) {
      return;
    }

    reset({
      company: application.company,
      position: application.position,
      status: application.status,

      appliedAt: application.appliedAt
        ? application.appliedAt.slice(0, 10)
        : '',

      jobUrl: application.jobUrl ?? '',
      location: application.location ?? '',
      employmentType: application.employmentType ?? '',
      workArrangement: application.workArrangement ?? '',

      salaryMin:
        application.salaryMin !== null ? String(application.salaryMin) : '',

      salaryMax:
        application.salaryMax !== null ? String(application.salaryMax) : '',

      notes: application.notes ?? '',
    });
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
