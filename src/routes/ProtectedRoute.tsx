import { Navigate, Outlet } from 'react-router';
import { useAuthInitialization } from '@hooks/use-auth-initialization';
import { useAuthStore } from '@stores/auth.store';

const ProtectedRoute = () => {
  useAuthInitialization();

  const status = useAuthStore((state) => state.status);

  if (status === 'checking') {
    return <h1>Checking Session</h1>;
  }
  
  if (status === 'unauthenticated') {
    return <Navigate to='/login' replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
