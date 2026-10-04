import { z } from 'zod';

export const jobImportSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, 'Job URL is required')
    .refine(
      (value) => z.url().safeParse(value).success,
      'Please enter a valid URL',
    ),
});

export type JobImportInput = z.infer<typeof jobImportSchema>;
