import { useMutation } from '@tanstack/react-query';
import { Outlet, useNavigate } from 'react-router';

import { logout } from '@api/auth.api';
import { clearAccessToken } from '@lib/auth-token';
import { useAuthStore } from '@stores/auth.store';
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/AppSidebar';
import AppHeader from '@/components/layout/AppHeader';

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
    <SidebarProvider>
      <AppSidebar
        username={user?.name}
        isLoggingOut={logoutMutation.isPending}
        onLogout={onLogout}
      />

      <SidebarInset>
        <AppHeader />

        <main className='flex-1 p-4'>
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AppLayout;
