import type { ApplicationStatus } from './application';

export type DashboardSummary = {
  total: number;
  wishlist: number;
  applied: number;
  screening: number;
  interview: number;
  technicalTest: number;
  offer: number;
  rejected: number;
  withdrawn: number;
};

export type RecentApplication = {
  id: string;
  company: string;
  position: string;
  status: ApplicationStatus;
  appliedAt: string | null;
  updatedAt: string;
};

export type DashboardData = {
  summary: DashboardSummary;
  recentApplications: RecentApplication[];
};

export type DashboardResponse = {
  success: boolean;
  message: string;
  data: DashboardData;
};
