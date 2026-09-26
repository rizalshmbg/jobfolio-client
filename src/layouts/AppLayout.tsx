import { useMutation } from '@tanstack/react-query';
import { Suspense } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { toast } from 'sonner';

import { logout } from '@api/auth.api';
import { clearAccessToken } from '@lib/auth-token';
import { useAuthStore } from '@stores/auth.store';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/AppSidebar';
import AppHeader from '@/components/layout/AppHeader';
import { getApiErrorMessage } from '@utils/get-api-error.message';
import { PageSkeleton } from '@/components/workspace';

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
      toast.success('You have been logged out successfully.');
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, 'Could not log out. Please try again.'),
      );
    },
  });

  const onLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <SidebarProvider>
      <a className='skip-link' href='#main-content'>
        Skip to content
      </a>
      <AppSidebar
        username={user?.name}
        isLoggingOut={logoutMutation.isPending}
        onLogout={onLogout}
      />

      <SidebarInset className='min-w-0 bg-background'>
        <AppHeader />

        <main id='main-content' className='workspace-main'>
          <Suspense fallback={<PageSkeleton />}>
            <Outlet />
          </Suspense>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AppLayout;
