import { z } from 'zod';

export const profileFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
});

export type ProfileFormInput = z.infer<typeof profileFormSchema>;

export const changePasswordFormSchema = z
  .object({
    currentPassword: z
      .string()
      .trim()
      .min(8, 'Password must be at least 8 characters')
      .max(64, 'Password must be at most 16 characters'),
    newPassword: z
      .string()
      .trim()
      .min(8, 'Password must be at least 8 characters')
      .max(64, 'Password must be at most 16 characters'),
    confirmPassword: z
      .string()
      .trim()
      .min(8, 'Password must be at least 8 characters')
      .max(64, 'Password must be at most 16 characters'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ChangePasswordFormInput = z.infer<typeof changePasswordFormSchema>;
