import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';

import { getApplications } from '@api/application.api';
import type {
  ApplicationListParams,
  ApplicationStatus,
  EmploymentType,
  WorkArrangement,
  ApplicationSortBy,
  SortOrder,
} from '@/types/application';
import { formatDate } from '@utils/format-date';
import { useDebounce } from '@hooks/use-debounce';
import { Link } from 'react-router';
import { queryKeys } from '@lib/query-keys';
import { getApiErrorMessage } from '@utils/get-api-error.message';

type ApplicationFilters = {
  page: number;
  search: string;
  status: ApplicationStatus | '';
  employmentType: EmploymentType | '';
  workArrangement: WorkArrangement | '';
  sortBy: ApplicationSortBy;
  order: SortOrder;
};

const ApplicationsPage = () => {
  const [filters, setFilters] = useState<ApplicationFilters>({
    page: 1,
    search: '',
    status: '',
    employmentType: '',
    workArrangement: '',
    sortBy: 'createdAt',
    order: 'desc',
  });

  const debouncedSearch = useDebounce(filters.search, 500);

  const params: ApplicationListParams = {
    page: filters.page,
    limit: 10,
    ...(debouncedSearch && {
      search: debouncedSearch,
    }),
    ...(filters.status && {
      status: filters.status,
    }),
    ...(filters.employmentType && {
      employmentType: filters.employmentType,
    }),
    ...(filters.workArrangement && {
      workArrangement: filters.workArrangement,
    }),
    sortBy: filters.sortBy,
    order: filters.order,
  };

  const applicationsQuery = useQuery({
    queryKey: queryKeys.applications.list(params),
    queryFn: () => getApplications(params),
    placeholderData: keepPreviousData,
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((current) => ({
      ...current,
      search: e.target.value,
      page: 1,
    }));
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((current) => ({
      ...current,
      status: e.target.value as ApplicationStatus | '',
      page: 1,
    }));
  };

  const handleEmploymentTypeChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setFilters((current) => ({
      ...current,
      employmentType: e.target.value as EmploymentType | '',
      page: 1,
    }));
  };

  const handleWorkArrangementChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setFilters((current) => ({
      ...current,
      workArrangement: e.target.value as WorkArrangement | '',
      page: 1,
    }));
  };

  const handleSortByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((current) => ({
      ...current,
      sortBy: e.target.value as ApplicationSortBy,
      page: 1,
    }));
  };

  const handleOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((current) => ({
      ...current,
      order: e.target.value as SortOrder,
      page: 1,
    }));
  };

  const handlePrevPage = () => {
    setFilters((current) => ({
      ...current,
      page: current.page - 1,
    }));
  };

  const handleNextPage = () => {
    setFilters((current) => ({
      ...current,
      page: current.page + 1,
    }));
  };

  if (applicationsQuery.isPending) {
    return <p>Loading applications...</p>;
  }

  if (applicationsQuery.isError) {
    return (
      <p>
        {getApiErrorMessage(
          applicationsQuery.error,
          'Failed to load application.',
        )}
      </p>
    );
  }

  const applications = applicationsQuery.data.data;
  const meta = applicationsQuery.data.meta;

  return (
    <main>
      <h1>ApplicationPage</h1>

      {applicationsQuery.isFetching && <p>Updating applications...</p>}

      <input
        type='search'
        placeholder='search company or position'
        value={filters.search}
        onChange={handleSearchChange}
      />

      <select value={filters.status} onChange={handleStatusChange}>
        <option value=''>All Status</option>
        <option value='WISHLIST'>Wishlist</option>
        <option value='APPLIED'>Applied</option>
        <option value='SCREENING'>Screening</option>
        <option value='INTERVIEW'>Interview</option>
        <option value='TECHNICAL_TEST'>Technical Test</option>
        <option value='OFFER'>Offer</option>
        <option value='REJECTED'>Rejected</option>
        <option value='WITHDRAWN'>Withdrawn</option>
      </select>

      <select
        value={filters.employmentType}
        onChange={handleEmploymentTypeChange}
      >
        <option value=''>All Employment Types</option>
        <option value='FULL_TIME'>Full Time</option>
        <option value='PART_TIME'>Part Time</option>
        <option value='CONTRACT'>Contract</option>
        <option value='INTERNSHIP'>Internship</option>
        <option value='FREELANCE'>Freelance</option>
      </select>

      <select
        value={filters.workArrangement}
        onChange={handleWorkArrangementChange}
      >
        <option value=''>All Work Arrangements</option>
        <option value='ONSITE'>Onsite</option>
        <option value='HYBRID'>Hybrid</option>
        <option value='REMOTE'>Remote</option>
      </select>

      <select value={filters.sortBy} onChange={handleSortByChange}>
        <option value='createdAt'>Created At</option>
        <option value='updatedAt'>Updated At</option>
        <option value='appliedAt'>Applied At</option>
        <option value='company'>Company</option>
        <option value='position'>Position</option>
        <option value='salaryMin'>Minimum Salary</option>
        <option value='salaryMax'>Maximum Salary</option>
      </select>

      <select value={filters.order} onChange={handleOrderChange}>
        <option value='desc'>Descending</option>
        <option value='asc'>Ascending</option>
      </select>

      {applications.length === 0 ? (
        <p>No applications found.</p>
      ) : (
        applications.map((application) => (
          <div key={application.id}>
            <p>{application.company}</p>
            <p>{application.position}</p>
            <p>{application.status}</p>
            <p>{application.employmentType ?? '-'}</p>
            <p>{application.workArrangement ?? '-'}</p>
            <p>
              {application.appliedAt ? formatDate(application.appliedAt) : '-'}
            </p>
            <Link to={`/applications/${application.id}`}>View Detail</Link>
            <hr />
          </div>
        ))
      )}

      <Link to='/applications/new'>Add Application</Link>

      <div>
        <p>
          Page {meta.page} of {meta.totalPages}
        </p>

        <p>Total applications: {meta.total}</p>
        <div>
          <button
            type='button'
            onClick={handlePrevPage}
            disabled={meta.page <= 1 || applicationsQuery.isFetching}
          >
            Previous
          </button>

          <button
            type='button'
            onClick={handleNextPage}
            disabled={
              meta.page >= meta.totalPages || applicationsQuery.isFetching
            }
          >
            Next
          </button>
        </div>
      </div>
    </main>
  );
};

export default ApplicationsPage;
