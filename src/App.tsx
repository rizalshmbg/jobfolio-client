import { Route, Routes } from 'react-router';

import { useAuthInitialization } from '@hooks/use-auth-initialization';

import ApplicationDetailPage from '@pages/ApplicationDetailPage';
import ApplicationsPage from '@pages/ApplicationsPage';
import DashboardPage from '@pages/DashboardPage';
import LandingPage from '@pages/LandingPage';
import LoginPage from '@pages/LoginPage';
import ProfilePage from '@pages/ProfilePage';
import RegisterPage from '@pages/RegisterPage';

const App = () => {
  useAuthInitialization();

  return (
    <Routes>
      <Route path='/' element={<LandingPage  />} />

      <Route path='/login' element={<LoginPage />} />
      <Route path='/register' element={<RegisterPage />} />

      <Route path='/dashboard' element={<DashboardPage />} />
      <Route path='/applications' element={<ApplicationsPage />} />
      <Route path='/applications/:id' element={<ApplicationDetailPage />} />
      <Route path='/profile' element={<ProfilePage />} />
    </Routes>
  );
};
export default App;
