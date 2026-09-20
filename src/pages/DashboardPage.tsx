import { useAuthStore } from '@stores/auth.store';

const DashboardPage = () => {
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);

  return (
    <main>
      <h1>DashboardPage</h1>

      {user && <p>Welcome, {user.name}</p>}

      <p>Status: {status}</p>
      <p>User: {user?.name ?? 'No user'}</p>
    </main>
  );
};
export default DashboardPage;
