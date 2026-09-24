import { z } from 'zod';

export const profileFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
});

export type ProfileFormInput = z.infer<typeof profileFormSchema>;
