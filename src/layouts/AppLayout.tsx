import { useMutation } from '@tanstack/react-query';
import { NavLink, Outlet, useNavigate } from 'react-router';

import { logout } from '@api/auth.api';
import { clearAccessToken } from '@lib/auth-token';
import { useAuthStore } from '@stores/auth.store';

const AppLayout = () => {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const setUnauthenticated = useAuthStore((state) => state.setUnauthenticated);

  const logoutMutation = useMutation({
    mutationFn: logout,

    onSuccess: () => {
      clearAccessToken();
      setUnauthenticated();

      navigate('/login', {
        replace: true,
      });
    },
  });

  const onLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div>
      <aside>
        <h1>JobFolio</h1>

        {user && <p>{user.name}</p>}

        <nav>
          <NavLink to='/dashboard'>Dashboard</NavLink>
          <NavLink to='/applications'>Applications</NavLink>
          <NavLink to='/profile'>Profile</NavLink>
        </nav>

        <button
          type='button'
          onClick={onLogout}
          disabled={logoutMutation.isPending}
        >
          {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
        </button>
      </aside>

      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
