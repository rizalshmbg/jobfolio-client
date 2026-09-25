import { useQuery } from '@tanstack/react-query';

import { getDashboard } from '@api/dashboard.api';
import { queryKeys } from '@lib/query-keys';
import { formatDate } from '@utils/format-date';
import { getApiErrorMessage } from '@utils/get-api-error.message';

const DashboardPage = () => {
  const dashboardQuery = useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: getDashboard,
  });

  if (dashboardQuery.isPending) {
    return <p>Loading dashboard...</p>;
  }

  if (dashboardQuery.isError) {
      return (
        <p>
          {getApiErrorMessage(
            dashboardQuery.error,
            'Failed to load dashboard.',
          )}
        </p>
      );
    }

  const dashboard = dashboardQuery.data.data;

  return (
    <main>
      <h1>DashboardPage</h1>
      <p>Total: {dashboard.summary.total}</p>
      <p>Applied: {dashboard.summary.applied}</p>
      <p>Interview: {dashboard.summary.interview}</p>
      <p>Offer: {dashboard.summary.offer}</p>
      <p>Rejected: {dashboard.summary.rejected}</p>
      <p>Screening: {dashboard.summary.screening}</p>
      <p>Technical Test: {dashboard.summary.technicalTest}</p>
      <p>Wishlist: {dashboard.summary.wishlist}</p>
      <p>Withdrawn: {dashboard.summary.withdrawn}</p>

      {dashboard.recentApplications.length === 0 ? (
        <p>No recent applications.</p>
      ) : (
        dashboard.recentApplications.map((application) => (
          <div key={application.id}>
            <p>{application.company}</p>
            <p>{application.position}</p>
            <p>{application.status}</p>
            <p>
              Applied:{' '}
              {application.appliedAt ? formatDate(application.appliedAt) : '-'}
            </p>

            <p>Updated: {formatDate(application.updatedAt)}</p>
          </div>
        ))
      )}
    </main>
  );
};
export default DashboardPage;
