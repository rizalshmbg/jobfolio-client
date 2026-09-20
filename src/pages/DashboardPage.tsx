import { useAuthStore } from "@stores/auth.store"

const DashboardPage = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <main>
      <h1>DashboardPage</h1>

      {user && (<p>Welcome, {user.name}</p>)}
    </main>
  )
}
export default DashboardPage