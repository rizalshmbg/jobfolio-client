import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Link } from 'react-router';
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
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
import { queryKeys } from '@lib/query-keys';
import { getApiErrorMessage } from '@utils/get-api-error.message';
import {
  AddApplicationLink,
  CompanyIcon,
  EmptyState,
  ErrorState,
  PageHeading,
  PageSkeleton,
  StatusBadge,
} from '@/components/workspace';
import { readable } from '@utils/format-label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type ApplicationFilters = {
  page: number;
  search: string;
  status: ApplicationStatus | '';
  employmentType: EmploymentType | '';
  workArrangement: WorkArrangement | '';
  sortBy: ApplicationSortBy;
  order: SortOrder;
};
const initialFilters: ApplicationFilters = {
  page: 1,
  search: '',
  status: '',
  employmentType: '',
  workArrangement: '',
  sortBy: 'createdAt',
  order: 'desc',
};
const statuses: ApplicationStatus[] = [
  'WISHLIST',
  'APPLIED',
  'SCREENING',
  'INTERVIEW',
  'TECHNICAL_TEST',
  'OFFER',
  'REJECTED',
  'WITHDRAWN',
];

export default function ApplicationsPage() {
  const [filters, setFilters] = useState<ApplicationFilters>(initialFilters);
  const [showFilters, setShowFilters] = useState(false);
  const debouncedSearch = useDebounce(filters.search, 500);

  const params: ApplicationListParams = {
    page: filters.page,
    limit: 10,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(filters.status && { status: filters.status }),
    ...(filters.employmentType && { employmentType: filters.employmentType }),
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

  const updateFilter = <K extends keyof ApplicationFilters>(
    key: K,
    value: ApplicationFilters[K],
  ) => setFilters((current) => ({ ...current, [key]: value, page: 1 }));

  const applications = applicationsQuery.data?.data ?? [];
  const meta = applicationsQuery.data?.meta;
  const filtered = !!(
    filters.search ||
    filters.status ||
    filters.employmentType ||
    filters.workArrangement
  );
  const advancedCount =
    Number(!!filters.employmentType) + Number(!!filters.workArrangement);

  return (
    <div className='page-stack'>
      <PageHeading
        eyebrow='YOUR PERSONAL APPLICATION TRACKER'
        title='Your applications'
        description='Every opportunity, every stage. Keep your next move in sight.'
      >
        <AddApplicationLink />
      </PageHeading>
      <section className='panel overflow-hidden'>
        <div
          className='application-tabs'
          aria-label='Filter by application status'
        >
          {[
            { value: '', label: 'All applications' },
            { value: 'WISHLIST', label: 'Wishlist' },
            { value: 'APPLIED', label: 'Applied' },
            { value: 'INTERVIEW', label: 'Interview' },
            { value: 'OFFER', label: 'Offers' },
          ].map((tab) => (
            <button
              key={tab.value}
              type='button'
              aria-pressed={filters.status === tab.value}
              className={filters.status === tab.value ? 'active' : ''}
              onClick={() =>
                updateFilter('status', tab.value as ApplicationStatus | '')
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className='application-toolbar'>
          <div className='search-field'>
            <Search size={17} />
            <Input
              type='search'
              aria-label='Search company or position'
              placeholder='Search by company or role...'
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
            />
          </div>
          <select
            className='select-control'
            aria-label='Application status'
            value={filters.status}
            onChange={(e) =>
              updateFilter('status', e.target.value as ApplicationStatus | '')
            }
          >
            <option value=''>All statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {readable(status)}
              </option>
            ))}
          </select>
          <Button
            variant='outline'
            onClick={() => setShowFilters(!showFilters)}
            aria-expanded={showFilters}
            aria-controls='application-filters'
          >
            <SlidersHorizontal size={16} />
            Filters
            {advancedCount > 0 && (
              <span className='filter-count'>{advancedCount}</span>
            )}
          </Button>
        </div>
        {showFilters && (
          <div id='application-filters' className='advanced-filters'>
            <label>
              Employment type
              <select
                className='select-control'
                value={filters.employmentType}
                onChange={(e) =>
                  updateFilter(
                    'employmentType',
                    e.target.value as EmploymentType | '',
                  )
                }
              >
                <option value=''>All employment types</option>
                {[
                  'FULL_TIME',
                  'PART_TIME',
                  'CONTRACT',
                  'INTERNSHIP',
                  'FREELANCE',
                ].map((value) => (
                  <option key={value} value={value}>
                    {readable(value)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Work arrangement
              <select
                className='select-control'
                value={filters.workArrangement}
                onChange={(e) =>
                  updateFilter(
                    'workArrangement',
                    e.target.value as WorkArrangement | '',
                  )
                }
              >
                <option value=''>All arrangements</option>
                {['ONSITE', 'HYBRID', 'REMOTE'].map((value) => (
                  <option key={value} value={value}>
                    {readable(value)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Sort by
              <select
                className='select-control'
                value={filters.sortBy}
                onChange={(e) =>
                  updateFilter('sortBy', e.target.value as ApplicationSortBy)
                }
              >
                {Object.entries({
                  createdAt: 'Date created',
                  updatedAt: 'Last updated',
                  appliedAt: 'Date applied',
                  company: 'Company',
                  position: 'Position',
                  salaryMin: 'Minimum salary',
                  salaryMax: 'Maximum salary',
                }).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Order
              <select
                className='select-control'
                value={filters.order}
                onChange={(e) =>
                  updateFilter('order', e.target.value as SortOrder)
                }
              >
                <option value='desc'>Descending</option>
                <option value='asc'>Ascending</option>
              </select>
            </label>
          </div>
        )}
        <div className='list-summary'>
          <p aria-live='polite'>
            {meta ? (
              <>
                <strong>{meta.total}</strong> {filtered ? 'matching ' : ''}
                application{meta.total !== 1 ? 's' : ''}
              </>
            ) : (
              'Your application collection'
            )}
            {applicationsQuery.isFetching && (
              <LoaderCircle className='ml-2 inline animate-spin' size={13} />
            )}
          </p>
          {filtered && (
            <button
              type='button'
              className='text-link text-xs'
              onClick={() => setFilters(initialFilters)}
            >
              <X size={13} />
              Clear filters
            </button>
          )}
        </div>
        {applicationsQuery.isPending ? (
          <div className='p-6'>
            <PageSkeleton />
          </div>
        ) : applicationsQuery.isError ? (
          <ErrorState
            message={getApiErrorMessage(
              applicationsQuery.error,
              'Failed to load applications.',
            )}
            retry={() => void applicationsQuery.refetch()}
          />
        ) : applications.length === 0 ? (
          <EmptyState filtered={filtered} />
        ) : (
          <div
            className='table-scroll'
            aria-busy={applicationsQuery.isFetching}
          >
            <table className='application-table'>
              <thead>
                <tr>
                  <th scope='col'>Company & role</th>
                  <th scope='col'>Status</th>
                  <th scope='col'>Employment</th>
                  <th scope='col'>Arrangement</th>
                  <th scope='col'>Date applied</th>
                  <th scope='col'>
                    <span className='sr-only'>View application</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <Link
                        to={`/applications/${app.id}`}
                        className='company-cell'
                      >
                        <CompanyIcon company={app.company} />
                        <div>
                          <strong>{app.position}</strong>
                          <span>
                            {app.company}
                            {app.location ? ` · ${app.location}` : ''}
                          </span>
                        </div>
                      </Link>
                    </td>
                    <td data-label='Status'>
                      <StatusBadge status={app.status} />
                    </td>
                    <td data-label='Employment'>
                      {app.employmentType ? readable(app.employmentType) : '—'}
                    </td>
                    <td data-label='Arrangement'>
                      {app.workArrangement ? (
                        <span className='arrangement-tag'>
                          {readable(app.workArrangement)}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td data-label='Date applied'>
                      {app.appliedAt
                        ? formatDate(app.appliedAt)
                        : 'Not applied yet'}
                    </td>
                    <td>
                      <Link
                        to={`/applications/${app.id}`}
                        className='row-link'
                        aria-label={`View ${app.position} at ${app.company}`}
                      >
                        <ArrowUpRight size={17} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {meta && !applicationsQuery.isError && (
          <div className='pagination'>
            <p>
              {meta.total > 0
                ? `Showing ${(meta.page - 1) * meta.limit + 1}–${Math.min(meta.page * meta.limit, meta.total)} of ${meta.total} applications`
                : '0 applications'}
            </p>
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='icon'
                aria-label='Previous page'
                onClick={() =>
                  setFilters((current) => ({
                    ...current,
                    page: current.page - 1,
                  }))
                }
                disabled={meta.page <= 1 || applicationsQuery.isFetching}
              >
                <ChevronLeft />
              </Button>
              <span className='px-2 text-xs'>
                Page {meta.page} of {Math.max(1, meta.totalPages)}
              </span>
              <Button
                variant='outline'
                size='icon'
                aria-label='Next page'
                onClick={() =>
                  setFilters((current) => ({
                    ...current,
                    page: current.page + 1,
                  }))
                }
                disabled={
                  meta.page >= meta.totalPages || applicationsQuery.isFetching
                }
              >
                <ChevronRight />
              </Button>
            </div>
          </div>
        )}
      </section>
      <p className='text-center text-xs text-muted-foreground'>
        A little organization goes a long way. Keep your applications up to
        date.
      </p>
    </div>
  );
}
