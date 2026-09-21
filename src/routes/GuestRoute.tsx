import { Navigate, Outlet } from 'react-router';
import { useAuthInitialization } from '@hooks/use-auth-initialization';
import { useAuthStore } from '@stores/auth.store';

const GuestRoute = () => {
  useAuthInitialization();

  const status = useAuthStore((state) => state.status);

  if (status === 'checking') {
    return <h1>Checking Session</h1>;
  }

  if (status === 'authenticated') {
    return <Navigate to='/dashboard' replace />;
  }

  return <Outlet />;
};

export default GuestRoute;
