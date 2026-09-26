import { Navigate, Outlet } from 'react-router';
import { useAuthInitialization } from '@hooks/use-auth-initialization';
import { useAuthStore } from '@stores/auth.store';
import SessionLoading from '@/components/SessionLoading';

const ProtectedRoute = () => {
  useAuthInitialization();

  const status = useAuthStore((state) => state.status);

  if (status === 'checking') {
    return <SessionLoading />;
  }

  if (status === 'unauthenticated') {
    return <Navigate to='/login' replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
