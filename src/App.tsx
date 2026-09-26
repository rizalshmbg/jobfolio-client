import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';
import LandingPage from '@pages/LandingPage';
import ProtectedRoute from '@routes/ProtectedRoute';
import GuestRoute from '@routes/GuestRoute';
import NotFoundPage from '@pages/NotFoundPage';
import SessionLoading from '@/components/SessionLoading';

const AppLayout = lazy(() => import('@layouts/AppLayout'));
const ApplicationDetailPage = lazy(
  () => import('@pages/ApplicationDetailPage'),
);
const ApplicationsPage = lazy(() => import('@pages/ApplicationsPage'));
const DashboardPage = lazy(() => import('@pages/DashboardPage'));
const LoginPage = lazy(() => import('@pages/LoginPage'));
const ProfilePage = lazy(() => import('@pages/ProfilePage'));
const RegisterPage = lazy(() => import('@pages/RegisterPage'));
const CreateApplicationPage = lazy(
  () => import('@pages/CreateApplicationPage'),
);
const EditApplicationPage = lazy(() => import('@pages/EditApplicationPage'));

const App = () => {
  return (
    <Suspense fallback={<SessionLoading />}>
      <Routes>
        <Route path='*' element={<NotFoundPage />} />
        <Route path='/' element={<LandingPage />} />

        {/* Guest Routes */}
        <Route element={<GuestRoute />}>
          <Route path='/login' element={<LoginPage />} />
          <Route path='/register' element={<RegisterPage />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path='/dashboard' element={<DashboardPage />} />
            <Route path='/applications' element={<ApplicationsPage />} />
            <Route
              path='/applications/:id'
              element={<ApplicationDetailPage />}
            />
            <Route
              path='/applications/new'
              element={<CreateApplicationPage />}
            />
            <Route
              path='/applications/:id/edit'
              element={<EditApplicationPage />}
            />
            <Route path='/profile' element={<ProfilePage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
};
export default App;
