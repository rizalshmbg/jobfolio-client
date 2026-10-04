import type { EmploymentType, WorkArrangement } from './application';

export type ScrapedJob = {
  company: string | null;
  position: string | null;
  description: string | null;
  requirements: string[];
  jobUrl: string;
  location: string | null;
  employmentType: EmploymentType | null;
  workArrangement: WorkArrangement | null;
  salaryMin: number | null;
  salaryMax: number | null;
};

export type JobImportResponse = {
  success: boolean;
  message: string;
  data: ScrapedJob;
};
