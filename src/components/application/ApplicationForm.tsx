import { Link } from 'react-router';
import { BriefcaseBusiness, FileText, LoaderCircle, Save } from 'lucide-react';
import type { ApplicationFormInput } from '@validations/application.validations';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/workspace';
import { readable } from '@utils/format-label';

type ApplicationFormProps = {
  register: UseFormRegister<ApplicationFormInput>;
  errors: FieldErrors<ApplicationFormInput>;
  isPending: boolean;
  submitLabel: string;
  cancelTo?: string;
};

export default function ApplicationForm({
  register,
  errors,
  isPending,
  submitLabel,
  cancelTo = '/applications',
}: Readonly<ApplicationFormProps>) {
  const validation = (name: keyof ApplicationFormInput) => ({
    'aria-invalid': !!errors[name],
    'aria-describedby': errors[name] ? `${name}-error` : undefined,
  });
  return (
    <div className='application-form'>
      <section className='panel'>
        <div className='form-section-heading'>
          <span className='section-icon'>
            <BriefcaseBusiness size={19} />
          </span>
          <div>
            <h2>The opportunity</h2>
            <p>Start with the essentials. Company and position are required.</p>
          </div>
        </div>
        <div className='form-grid'>
          <Field id='company' label='Company' error={errors.company?.message}>
            <Input
              id='company'
              placeholder='e.g. Acme Studio'
              {...validation('company')}
              {...register('company')}
            />
          </Field>
          <Field
            id='position'
            label='Position'
            error={errors.position?.message}
          >
            <Input
              id='position'
              placeholder='e.g. Product Designer'
              {...validation('position')}
              {...register('position')}
            />
          </Field>
          <Field
            id='status'
            label='Application status'
            error={errors.status?.message}
          >
            <select
              className='select-control'
              id='status'
              {...validation('status')}
              {...register('status')}
            >
              {[
                'WISHLIST',
                'APPLIED',
                'SCREENING',
                'INTERVIEW',
                'TECHNICAL_TEST',
                'OFFER',
                'REJECTED',
                'WITHDRAWN',
              ].map((value) => (
                <option key={value} value={value}>
                  {readable(value)}
                </option>
              ))}
            </select>
          </Field>
          <Field
            id='appliedAt'
            label='Date applied'
            optional
            error={errors.appliedAt?.message}
          >
            <Input
              id='appliedAt'
              type='date'
              {...validation('appliedAt')}
              {...register('appliedAt')}
            />
          </Field>
          <Field
            id='jobUrl'
            label='Job posting URL'
            optional
            error={errors.jobUrl?.message}
          >
            <Input
              id='jobUrl'
              type='url'
              placeholder='https://company.com/careers/role'
              {...validation('jobUrl')}
              {...register('jobUrl')}
            />
          </Field>
          <Field
            id='location'
            label='Location'
            optional
            error={errors.location?.message}
          >
            <Input
              id='location'
              placeholder='e.g. Jakarta, Indonesia'
              {...validation('location')}
              {...register('location')}
            />
          </Field>
          <Field
            id='employmentType'
            label='Employment type'
            optional
            error={errors.employmentType?.message}
          >
            <select
              className='select-control'
              id='employmentType'
              {...validation('employmentType')}
              {...register('employmentType')}
            >
              <option value=''>Select employment type</option>
              {[
                'FULL_TIME',
                'PART_TIME',
                'CONTRACT',
                'INTERNSHIP',
                'FREELANCE',
              ].map((value) => (
                <option key={value} value={value}>
                  {readable(value)}
                </option>
              ))}
            </select>
          </Field>
          <Field
            id='workArrangement'
            label='Work arrangement'
            optional
            error={errors.workArrangement?.message}
          >
            <select
              className='select-control'
              id='workArrangement'
              {...validation('workArrangement')}
              {...register('workArrangement')}
            >
              <option value=''>Select arrangement</option>
              {['ONSITE', 'HYBRID', 'REMOTE'].map((value) => (
                <option key={value} value={value}>
                  {readable(value)}
                </option>
              ))}
            </select>
          </Field>
          <Field
            id='salaryMin'
            label='Minimum salary'
            optional
            error={errors.salaryMin?.message}
          >
            <Input
              id='salaryMin'
              type='number'
              min='0'
              step='1'
              placeholder='e.g. 8000000'
              {...validation('salaryMin')}
              {...register('salaryMin')}
            />
          </Field>
          <Field
            id='salaryMax'
            label='Maximum salary'
            optional
            error={errors.salaryMax?.message}
          >
            <Input
              id='salaryMax'
              type='number'
              min='0'
              step='1'
              placeholder='e.g. 12000000'
              {...validation('salaryMax')}
              {...register('salaryMax')}
            />
          </Field>
        </div>
      </section>
      <section className='panel'>
        <div className='form-section-heading'>
          <span className='section-icon'>
            <FileText size={19} />
          </span>
          <div>
            <h2>A few things to remember</h2>
            <p>
              Keep useful details close, so nothing gets lost along the way.
            </p>
          </div>
        </div>
        <div className='p-6'>
          <Field
            id='notes'
            label='Notes'
            optional
            error={errors.notes?.message}
          >
            <textarea
              className='textarea-control'
              id='notes'
              rows={5}
              placeholder='Recruiter details, interview notes, follow-up reminders...'
              {...validation('notes')}
              {...register('notes')}
            />
            <span className='text-xs text-muted-foreground'>
              Up to 2,000 characters.
            </span>
          </Field>
        </div>
      </section>
      <div className='form-actions'>
        <Link className='action-link action-link-secondary' to={cancelTo}>
          Cancel
        </Link>
        <Button type='submit' disabled={isPending}>
          {isPending ? (
            <LoaderCircle className='animate-spin' />
          ) : (
            <Save size={16} />
          )}
          {isPending ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </div>
  );
}
