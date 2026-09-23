import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { getApplicationById, updateApplication } from '@api/application.api';
import {
  createApplicationSchema,
  type CreateApplicationFormInput,
} from '@validations/application.validations';
import type { UpdateApplicationInput } from '@/types/application';

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
  } = useForm<CreateApplicationFormInput>({
    resolver: zodResolver(createApplicationSchema),
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

  const onSubmit = (data: CreateApplicationFormInput) => {
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
        <div>
          <label htmlFor='company'>Company</label>
          <input id='company' type='text' {...register('company')} />
          {errors.company && <p>{errors.company.message}</p>}
        </div>

        <div>
          <label htmlFor='position'>Position</label>
          <input id='position' type='text' {...register('position')} />
          {errors.position && <p>{errors.position.message}</p>}
        </div>

        <div>
          <label htmlFor='status'>Status</label>
          <select id='status' {...register('status')}>
            <option value='WISHLIST'>Wishlist</option>
            <option value='APPLIED'>Applied</option>
            <option value='SCREENING'>Screening</option>
            <option value='INTERVIEW'>Interview</option>
            <option value='TECHNICAL_TEST'>Technical Test</option>
            <option value='OFFER'>Offer</option>
            <option value='REJECTED'>Rejected</option>
            <option value='WITHDRAWN'>Withdrawn</option>
          </select>
        </div>

        <div>
          <label htmlFor='appliedAt'>Applied At</label>
          <input type='date' id='appliedAt' {...register('appliedAt')} />
        </div>

        <div>
          <label htmlFor='jobUrl'>JobUrl</label>
          <input id='jobUrl' type='url' {...register('jobUrl')} />
          {errors.jobUrl && <p>{errors.jobUrl.message}</p>}
        </div>

        <div>
          <label htmlFor='location'>Location</label>
          <input id='location' type='text' {...register('location')} />
          {errors.location && <p>{errors.location.message}</p>}
        </div>

        <div>
          <label htmlFor='employmentType'>Select Employment Type</label>
          <select id='employmentType' {...register('employmentType')}>
            <option value=''>Select employment type</option>
            <option value='FULL_TIME'>Full Time</option>
            <option value='PART_TIME'>Part Time</option>
            <option value='CONTRACT'>Contract</option>
            <option value='INTERNSHIP'>Internship</option>
            <option value='FREELANCE'>Freelance</option>
          </select>
        </div>

        <div>
          <label htmlFor='workArrangement'>Select Work Arrangement Type</label>
          <select id='workArrangement' {...register('workArrangement')}>
            <option value=''>Select Work Arrangements</option>
            <option value='ONSITE'>Onsite</option>
            <option value='HYBRID'>Hybrid</option>
            <option value='REMOTE'>Remote</option>
          </select>
        </div>

        <div>
          <label htmlFor='salaryMin'>Salary Min</label>
          <input
            id='salaryMin'
            type='number'
            min='0'
            step='1'
            {...register('salaryMin')}
          />
          {errors.salaryMin && <p>{errors.salaryMin.message}</p>}
        </div>

        <div>
          <label htmlFor='salaryMax'>Salary Max</label>
          <input
            id='salaryMax'
            type='number'
            min='0'
            step='1'
            {...register('salaryMax')}
          />
          {errors.salaryMax && <p>{errors.salaryMax.message}</p>}
        </div>

        <div>
          <label htmlFor='notes'>Notes</label>
          <textarea id='notes' {...register('notes')} />
          {errors.notes && <p>{errors.notes.message}</p>}
        </div>

        <button type='submit' disabled={updateMutation.isPending}>
          {updateMutation.isPending ? 'Updating...' : 'Update Application'}
        </button>
      </form>
    </main>
  );
};

export default EditApplicationPage;
