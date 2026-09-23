import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  createApplicationSchema,
  type CreateApplicationFormInput,
} from '@validations/application.validations';
import type { CreateApplicationInput } from '@/types/application';
import { createApplication } from '@api/application.api';
import { useNavigate } from 'react-router';

const CreateApplicationPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
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

  const onSubmit = (data: CreateApplicationFormInput) => {
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

        <button type='submit' disabled={createMutation.isPending}>
          {createMutation.isPending ? 'Creating...' : 'Create Application'}
        </button>
      </form>
    </main>
  );
};
export default CreateApplicationPage;
