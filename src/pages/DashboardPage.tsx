import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  CircleCheck,
  Sparkles,
  Target,
  Workflow,
} from 'lucide-react';
import { getDashboard } from '@api/dashboard.api';
import { queryKeys } from '@lib/query-keys';
import { formatDate } from '@utils/format-date';
import { getApiErrorMessage } from '@utils/get-api-error.message';
import { useAuthStore } from '@stores/auth.store';
import {
  AddApplicationLink,
  CompanyIcon,
  EmptyState,
  ErrorState,
  PageHeading,
  PageSkeleton,
  StatusBadge,
  ViewLink,
} from '@/components/workspace';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const dashboardQuery = useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: getDashboard,
  });

  if (dashboardQuery.isPending) return <PageSkeleton />;
  if (dashboardQuery.isError)
    return (
      <ErrorState
        message={getApiErrorMessage(
          dashboardQuery.error,
          'Failed to load dashboard.',
        )}
        retry={() => void dashboardQuery.refetch()}
      />
    );

  const { summary, recentApplications } = dashboardQuery.data.data;
  const active =
    summary.applied +
    summary.screening +
    summary.interview +
    summary.technicalTest;
  const stages = [
    { name: 'Wishlist', count: summary.wishlist, color: '#a3a1b3' },
    { name: 'Applied', count: summary.applied, color: '#8b7bea' },
    { name: 'Screening', count: summary.screening, color: '#5d9dde' },
    { name: 'Interview', count: summary.interview, color: '#eab76a' },
    { name: 'Technical test', count: summary.technicalTest, color: '#d190bf' },
    { name: 'Offer', count: summary.offer, color: '#64b99c' },
    { name: 'Rejected', count: summary.rejected, color: '#e58c90' },
    { name: 'Withdrawn', count: summary.withdrawn, color: '#c8c7d0' },
  ];
  const segments = stages.reduce<{ end: number; stops: string[] }>(
    (acc, stage) => {
      const end =
        acc.end + (summary.total ? (stage.count / summary.total) * 100 : 0);
      return {
        end,
        stops: [...acc.stops, `${stage.color} ${acc.end}% ${end}%`],
      };
    },
    { end: 0, stops: [] },
  );
  const stats = [
    {
      label: 'Total applications',
      value: summary.total,
      detail: 'Every opportunity, accounted for',
      icon: BriefcaseBusiness,
      tone: 'violet',
    },
    {
      label: 'In progress',
      value: active,
      detail: 'Active in your recruitment pipeline',
      icon: Workflow,
      tone: 'blue',
    },
    {
      label: 'Interviews',
      value: summary.interview,
      detail: 'Opportunities to make an impression',
      icon: Target,
      tone: 'amber',
    },
    {
      label: 'Offers received',
      value: summary.offer,
      detail: 'Your hard work, paying off',
      icon: Sparkles,
      tone: 'green',
    },
  ];

  return (
    <div className='page-stack'>
      <PageHeading
        eyebrow='YOUR JOB SEARCH, AT A GLANCE'
        title={`Welcome back${user?.name ? `, ${user.name.split(' ')[0]}` : ''}.`}
        description='Every application is a step forward. Here’s where you stand.'
      >
        <AddApplicationLink />
      </PageHeading>
      <div className='stats-grid'>
        {stats.map(({ label, value, detail, icon: Icon, tone }) => (
          <section className='stat-card' key={label}>
            <div className='flex items-center justify-between gap-2'>
              <h2>{label}</h2>
              <span className={`stat-icon tone-${tone}`}>
                <Icon size={18} />
              </span>
            </div>
            <strong>{value.toString().padStart(2, '0')}</strong>
            <p>{detail}</p>
          </section>
        ))}
      </div>
      <div className='dashboard-charts'>
        <section className='panel pipeline-panel'>
          <div className='panel-heading'>
            <div>
              <h2>Application pipeline</h2>
              <p>A little perspective on your progress.</p>
            </div>
            <span className='subtle-tag'>All time</span>
          </div>
          <div
            className='pipeline-bars'
            aria-label='Applications by current recruitment stage'
          >
            {stages.slice(0, 6).map((stage) => (
              <div className='pipeline-column' key={stage.name}>
                <span className='pipeline-count'>{stage.count}</span>
                <div className='pipeline-bar-track'>
                  <div
                    className='pipeline-bar'
                    style={{
                      height: `${stage.count ? Math.max(5, (stage.count / Math.max(...stages.slice(0, 6).map((s) => s.count), 1)) * 100) : 0}%`,
                      backgroundColor: stage.color,
                    }}
                  />
                </div>
                <span className='pipeline-label'>{stage.name}</span>
              </div>
            ))}
          </div>
          <div className='panel-footnote'>
            <span className='size-1.5 rounded-full bg-primary' />
            Current stage of each application · {summary.total} total
          </div>
        </section>
        <section className='panel status-panel'>
          <div className='panel-heading'>
            <div>
              <h2>Status breakdown</h2>
              <p>Your whole search, in one view.</p>
            </div>
          </div>
          <div className='status-chart-body'>
            <div
              className='status-donut'
              role='img'
              aria-label={`${summary.total} total applications; ${active} in progress; ${summary.offer} offers; ${summary.rejected} rejected; ${summary.withdrawn} withdrawn; ${summary.wishlist} on wishlist.`}
              style={{
                background: summary.total
                  ? `conic-gradient(${segments.stops.join(', ')})`
                  : '#efedf5',
              }}
            >
              <div>
                <strong>{summary.total}</strong>
                <span>applications</span>
              </div>
            </div>
            <div className='status-legend'>
              {stages.map((stage) => (
                <div key={stage.name}>
                  <span className='flex items-center gap-2'>
                    <i style={{ background: stage.color }} />
                    {stage.name}
                  </span>
                  <strong>{stage.count}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      <section className='panel'>
        <div className='panel-heading'>
          <div>
            <h2>Recent applications</h2>
            <p>Your latest steps toward what’s next.</p>
          </div>
          <ViewLink to='/applications' />
        </div>
        {recentApplications.length === 0 ? (
          <EmptyState />
        ) : (
          <div className='table-scroll'>
            <table className='application-table'>
              <thead>
                <tr>
                  <th scope='col'>Company & role</th>
                  <th scope='col'>Status</th>
                  <th scope='col'>Date applied</th>
                  <th scope='col'>Last updated</th>
                  <th scope='col'>
                    <span className='sr-only'>View application</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentApplications.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <Link
                        to={`/applications/${app.id}`}
                        className='company-cell'
                      >
                        <CompanyIcon company={app.company} />
                        <div>
                          <strong>{app.position}</strong>
                          <span>{app.company}</span>
                        </div>
                      </Link>
                    </td>
                    <td data-label='Status'>
                      <StatusBadge status={app.status} />
                    </td>
                    <td data-label='Date applied'>
                      {app.appliedAt
                        ? formatDate(app.appliedAt)
                        : 'Not applied yet'}
                    </td>
                    <td data-label='Last updated'>
                      {formatDate(app.updatedAt)}
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
      </section>
      <div className='dashboard-note'>
        <div className='flex items-center gap-3'>
          <CircleCheck size={18} className='text-primary' />
          <p>Progress looks different every day. Keep taking the next step.</p>
        </div>
        <span className='hidden items-center gap-2 text-xs text-muted-foreground sm:flex'>
          <CalendarDays size={14} />
          Your journey, your pace
        </span>
      </div>
    </div>
  );
}
