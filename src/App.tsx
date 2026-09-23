import { Route, Routes } from 'react-router';

import ApplicationDetailPage from '@pages/ApplicationDetailPage';
import ApplicationsPage from '@pages/ApplicationsPage';
import DashboardPage from '@pages/DashboardPage';
import LandingPage from '@pages/LandingPage';
import LoginPage from '@pages/LoginPage';
import ProfilePage from '@pages/ProfilePage';
import RegisterPage from '@pages/RegisterPage';
import ProtectedRoute from '@routes/ProtectedRoute';
import GuestRoute from '@routes/GuestRoute';
import CreateApplicationPage from '@pages/CreateApplicationPage';

const App = () => {
  return (
    <Routes>
      <Route path='/' element={<LandingPage />} />

      {/* Guest Routes */}
      <Route element={<GuestRoute />}>
        <Route path='/login' element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path='/dashboard' element={<DashboardPage />} />
        <Route path='/applications' element={<ApplicationsPage />} />
        <Route path='/applications/:id' element={<ApplicationDetailPage />} />
        <Route path='/applications/new' element={<CreateApplicationPage />} />
        <Route path='/profile' element={<ProfilePage />} />
      </Route>
    </Routes>
  );
};
export default App;
