import type {
  Application,
  CreateApplicationInput,
  UpdateApplicationInput,
} from '@/types/application';
import type { ApplicationFormInput } from '@validations/application.validations';

export const applicationFormDefaultValues: ApplicationFormInput = {
  company: '',
  position: '',
  description: '',
  requirements: [],
  status: 'APPLIED',
  appliedAt: '',
  jobUrl: '',
  location: '',
  employmentType: '',
  workArrangement: '',
  salaryMin: '',
  salaryMax: '',
  notes: '',
};

export const applicationToFormValues = (
  application: Application,
): ApplicationFormInput => {
  return {
    company: application.company,
    position: application.position,
    description: application.description ?? '',
    requirements: application.requirements ?? [],
    status: application.status,
    appliedAt: application.appliedAt ? application.appliedAt.slice(0, 10) : '',
    jobUrl: application.jobUrl ?? '',
    location: application.location ?? '',
    employmentType: application.employmentType ?? '',
    workArrangement: application.workArrangement ?? '',
    salaryMin:
      application.salaryMin !== null ? String(application.salaryMin) : '',
    salaryMax:
      application.salaryMax !== null ? String(application.salaryMax) : '',
    notes: application.notes ?? '',
  };
};

export const formToCreateApplication = (
  data: ApplicationFormInput,
): CreateApplicationInput => {
  return {
    company: data.company,
    position: data.position,
    status: data.status,

    ...(data.description && {
      description: data.description,
    }),

    ...(data.requirements &&
      data.requirements.length > 0 && {
        requirements: data.requirements,
      }),

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

    ...(data.salaryMin !== '' && {
      salaryMin: Number(data.salaryMin),
    }),

    ...(data.salaryMax !== '' && {
      salaryMax: Number(data.salaryMax),
    }),

    ...(data.notes && {
      notes: data.notes,
    }),
  };
};

export const formToUpdateApplication = (
  data: ApplicationFormInput,
): UpdateApplicationInput => {
  return {
    company: data.company,
    position: data.position,
    description: data.description || null,
    requirements:
      data.requirements && data.requirements.length > 0
        ? data.requirements
        : null,
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
};
