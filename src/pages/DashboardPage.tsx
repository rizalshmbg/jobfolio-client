import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';

import { logout } from '@api/auth.api';
import { clearAccessToken } from '@lib/auth-token';
import { useAuthStore } from '@stores/auth.store';

const DashboardPage = () => {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const setUnauthenticated = useAuthStore((state) => state.setUnauthenticated);

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

  return (
    <main>
      <h1>DashboardPage</h1>

      {user && <p>Welcome, {user.name}</p>}

      <p>Status: {status}</p>
      <p>User: {user?.name ?? 'No user'}</p>

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
