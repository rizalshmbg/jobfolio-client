import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const ALLOWED_FILE_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

export const resumeFileSchema = z
  .instanceof(File, {
    message: 'Resume file is required',
  })
  .refine((file) => file.size <= MAX_FILE_SIZE, {
    message: 'Resume file size must not exceed 5 MB',
  })
  .refine((file) => ALLOWED_FILE_TYPES.has(file.type), {
    message: 'Resume file must be PDF, DOC, or DOCX',
  });

export type ResumeFileInput = z.infer<typeof resumeFileSchema>;
