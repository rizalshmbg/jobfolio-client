import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';

import { logout } from '@api/auth.api';
import { getDashboard } from '@api/dashboard.api';
import { clearAccessToken } from '@lib/auth-token';
import { useAuthStore } from '@stores/auth.store';
import { formatDate } from '@utils/format-date';

const DashboardPage = () => {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const setUnauthenticated = useAuthStore((state) => state.setUnauthenticated);

  const dashboardQuery = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clearAccessToken();
      setUnauthenticated();
      navigate('/login', { replace: true });
    },
  });

  const onLogout = () => {
    logoutMutation.mutate();
  };

  if (dashboardQuery.isPending) {
    return <p>Loading dashboard...</p>;
  }

  if (dashboardQuery.isError) {
    return <p>Failed to load dashboard.</p>;
  }

  const dashboard = dashboardQuery.data.data;

  return (
    <main>
      <h1>DashboardPage</h1>

      {user && <p>Welcome, {user.name}</p>}

      <p>Status: {status}</p>
      <p>User: {user?.name ?? 'No user'}</p>
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

      <button
        type='button'
        onClick={onLogout}
        disabled={logoutMutation.isPending}
      >
        {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
      </button>
    </main>
  );
};
export default DashboardPage;
