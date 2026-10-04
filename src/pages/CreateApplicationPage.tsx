import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  applicationFormSchema,
  type ApplicationFormInput,
} from '@validations/application.validations';
import { createApplication } from '@api/application.api';
import { importJob } from '@api/job-import.api';
import {
  jobImportSchema,
  type JobImportInput,
} from '@validations/job-import.validations';
import { useNavigate } from 'react-router';
import ApplicationForm from '@components/application/ApplicationForm';
import {
  applicationFormDefaultValues,
  formToCreateApplication,
} from '@utils/application-form';
import { queryKeys } from '@lib/query-keys';
import { getApiErrorMessage } from '@utils/get-api-error.message';
import { BackLink } from '@components/common/BackLink';
import { PageHeading } from '@components/common/PageHeading';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Field } from '@components/common/Field';
import { Import, LoaderCircle } from 'lucide-react';

const CreateApplicationPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register: registerImport,
    handleSubmit: handleImportSubmit,
    formState: { errors: importErrors },
  } = useForm<JobImportInput>({
    resolver: zodResolver(jobImportSchema),
    defaultValues: {
      url: '',
    },
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ApplicationFormInput>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: applicationFormDefaultValues,
  });

  const importMutation = useMutation({
    mutationFn: importJob,
    onSuccess: (response) => {
      const job = response.data;

      reset({
        company: job.company ?? '',
        position: job.position ?? '',
        description: job.description ?? '',
        requirements: job.requirements ?? [],
        status: 'APPLIED',
        appliedAt: '',
        jobUrl: job.jobUrl ?? '',
        location: job.location ?? '',
        employmentType: job.employmentType ?? '',
        workArrangement: job.workArrangement ?? '',
        salaryMin: job.salaryMin !== null ? String(job.salaryMin) : '',
        salaryMax: job.salaryMax !== null ? String(job.salaryMax) : '',
        notes: '',
      });

      toast.success('Job information imported successfully.');
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, 'Failed to import job information.'),
      );
    },
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

  const onImportSubmit = (data: JobImportInput) => {
    importMutation.mutate(data.url);
  };

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

      <section className='panel mb-4'>
        <div className='form-section-heading'>
          <span className='section-icon'>
            <Import size={19} />
          </span>

          <div>
            <h2>Import from job URL</h2>
            <p>
              Import job information automatically from a supported job listing
              URL.
            </p>
          </div>
        </div>

        <div className='p-6'>
          <form onSubmit={handleImportSubmit(onImportSubmit)} noValidate>
            <Field
              id='job-url'
              label='Job URL'
              error={importErrors.url?.message}
            >
              <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                <Input
                  id='job-url'
                  type='url'
                  placeholder='https://www.jobstreet.co.id/...'
                  aria-invalid={!!importErrors.url}
                  aria-describedby={
                    importErrors.url ? 'job-url-error' : undefined
                  }
                  {...registerImport('url')}
                />

                <Button type='submit' disabled={importMutation.isPending}>
                  {importMutation.isPending && (
                    <LoaderCircle className='animate-spin' />
                  )}
                  {importMutation.isPending ? 'Importing...' : 'Import job'}
                </Button>
              </div>
            </Field>
          </form>
        </div>
      </section>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <ApplicationForm
          register={register}
          control={control}
          errors={errors}
          isPending={createMutation.isPending}
          submitLabel='Add application'
        />
      </form>
    </div>
  );
};
export default CreateApplicationPage;
