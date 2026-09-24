import type { ApplicationFormInput } from '@validations/application.validations';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';

type ApplicationFormProps = {
  register: UseFormRegister<ApplicationFormInput>;
  errors: FieldErrors<ApplicationFormInput>;
  isPending: boolean;
  submitLabel: string;
};

const ApplicationForm = ({
  register,
  errors,
  isPending,
  submitLabel,
}: ApplicationFormProps) => {
  return (
    <div>
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

      <button type='submit' disabled={isPending}>
        {isPending ? 'Saving...' : submitLabel}
      </button>
    </div>
  );
};

export default ApplicationForm;
