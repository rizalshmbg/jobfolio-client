import { z } from 'zod';

export const createApplicationSchema = z
  .object({
    company: z
      .string()
      .trim()
      .min(1, 'Company is required')
      .max(100, 'Company must be at most 100 characters'),
    position: z
      .string()
      .trim()
      .min(1, 'Position is required')
      .max(100, 'Position must be at most 100 characters'),
    status: z.enum([
      'WISHLIST',
      'APPLIED',
      'SCREENING',
      'INTERVIEW',
      'TECHNICAL_TEST',
      'OFFER',
      'REJECTED',
      'WITHDRAWN',
    ]),
    appliedAt: z.string(),
    jobUrl: z
      .string()
      .refine(
        (value) => value === '' || z.url().safeParse(value).success,
        'Please enter a valid URL',
      ),
    location: z.string().max(100),
    employmentType: z.enum([
      '',
      'FULL_TIME',
      'PART_TIME',
      'CONTRACT',
      'INTERNSHIP',
      'FREELANCE',
    ]),
    workArrangement: z.enum(['', 'ONSITE', 'HYBRID', 'REMOTE']),
    salaryMin: z
      .string()
      .refine(
        (value) =>
          value === '' ||
          (Number.isInteger(Number(value)) && Number(value) >= 0),
        'Minimum salary must be a non-negative integer',
      ),
    salaryMax: z
      .string()
      .refine(
        (value) =>
          value === '' ||
          (Number.isInteger(Number(value)) && Number(value) >= 0),
        'Maximum salary must be a non-negative integer',
      ),
    notes: z.string().max(2000, 'Notes must be at most 2000 characters'),
  })
  .refine(
    (data) => {
      if (!data.salaryMin || !data.salaryMax) {
        return true;
      }
      return Number(data.salaryMin) <= Number(data.salaryMax);
    },
    {
      message: 'Maximum salary must be greater than or equal to minimum salary',
      path: ['salaryMax'],
    },
  );

export type CreateApplicationFormInput = z.infer<
  typeof createApplicationSchema
>;
