export type ApplicationStatus =
  | 'WISHLIST'
  | 'APPLIED'
  | 'SCREENING'
  | 'INTERVIEW'
  | 'TECHNICAL_TEST'
  | 'OFFER'
  | 'REJECTED'
  | 'WITHDRAWN';

export type EmploymentType =
  | 'FULL_TIME'
  | 'PART_TIME'
  | 'CONTRACT'
  | 'INTERNSHIP'
  | 'FREELANCE';

export type WorkArrangement = 'ONSITE' | 'HYBRID' | 'REMOTE';

export type ApplicationSortBy =
  | 'createdAt'
  | 'updatedAt'
  | 'appliedAt'
  | 'company'
  | 'position'
  | 'salaryMin'
  | 'salaryMax';

export type SortOrder = 'asc' | 'desc';

export type Application = {
  id: string;
  company: string;
  position: string;
  status: ApplicationStatus;
  appliedAt: string | null;
  jobUrl: string | null;
  location: string | null;
  employmentType: EmploymentType | null;
  workArrangement: WorkArrangement | null;
  salaryMin: number | null;
  salaryMax: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
};

export type ApplicationListParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: ApplicationStatus;
  employmentType?: EmploymentType;
  workArrangement?: WorkArrangement;
  sortBy?: ApplicationSortBy;
  order?: SortOrder;
};

export type ApplicationPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ApplicationsResponse = {
  success: boolean;
  message: string;
  data: Application[];
  meta: ApplicationPagination;
};

export type ApplicationDetailResponse = {
  success: boolean;
  message: string;
  data: Application;
};
