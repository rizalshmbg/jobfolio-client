import { useState } from 'react';
import { Link } from 'react-router';
import {
  BriefcaseBusiness,
  FileText,
  LoaderCircle,
  Save,
  X,
} from 'lucide-react';
import type { ApplicationFormInput } from '@validations/application.validations';
import {
  useController,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from 'react-hook-form';
import { Input } from '@components/ui/input';
import { Button } from '@components/ui/button';
import { Field } from '@components/common/Field';
import { readable } from '@utils/format-label';

type ApplicationFormProps = {
  register: UseFormRegister<ApplicationFormInput>;
  control: Control<ApplicationFormInput>;
  errors: FieldErrors<ApplicationFormInput>;
  isPending: boolean;
  submitLabel: string;
  cancelTo?: string;
};

export default function ApplicationForm({
  register,
  control,
  errors,
  isPending,
  submitLabel,
  cancelTo = '/applications',
}: Readonly<ApplicationFormProps>) {
  const validation = (name: keyof ApplicationFormInput) => ({
    'aria-invalid': !!errors[name],
    'aria-describedby': errors[name] ? `${name}-error` : undefined,
  });

  const { field: requirementsField, fieldState: requirementsFieldState } =
    useController({
      name: 'requirements',
      control,
      defaultValue: [],
    });

  const [requirementInput, setRequirementInput] = useState('');

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
            id='description'
            label='Job description'
            error={errors.description?.message}
            optional
          >
            <textarea
              className='textarea-control'
              id='description'
              rows={5}
              placeholder='e.g. A brief description of the role, responsibilities, and requirements.'
              {...validation('description')}
              {...register('description')}
            />
            <span className='text-xs text-muted-foreground'>
              Up to 2,000 characters.
            </span>
          </Field>
          <Field
            id='requirements'
            label='Requirements'
            error={
              requirementsFieldState.error?.message ??
              errors.requirements?.message
            }
            optional
          >
            <div
              className='requirements-input'
              aria-invalid={!!errors.requirements}
            >
              {requirementsField.value.map((requirement, index) => (
                <span
                  className='requirement-tag'
                  key={`${requirement}-${index}`}
                >
                  {requirement}

                  <button
                    type='button'
                    className='requirement-tag-remove'
                    aria-label={`Remove ${requirement}`}
                    onClick={() => {
                      requirementsField.onChange(
                        requirementsField.value.filter(
                          (_, requirementIndex) => requirementIndex !== index,
                        ),
                      );
                    }}
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}

              <input
                id='requirements'
                type='text'
                value={requirementInput}
                placeholder={
                  requirementsField.value.length === 0
                    ? 'e.g. React, TypeScript, Figma'
                    : 'Add a requirement...'
                }
                onChange={(event) => {
                  setRequirementInput(event.target.value);
                }}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter') {
                    return;
                  }

                  event.preventDefault();

                  const value = requirementInput.trim();

                  if (!value) {
                    return;
                  }

                  if (requirementsField.value.includes(value)) {
                    setRequirementInput('');
                    return;
                  }

                  requirementsField.onChange([
                    ...requirementsField.value,
                    value,
                  ]);

                  setRequirementInput('');
                }}
                onBlur={() => {
                  requirementsField.onBlur();
                }}
                aria-invalid={!!errors.requirements}
                aria-describedby={
                  errors.requirements ? 'requirements-error' : undefined
                }
              />
            </div>

            <span className='text-xs text-muted-foreground'>
              Press Enter to add a requirement.
            </span>
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
