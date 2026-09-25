import { NavLink, Outlet } from 'react-router';

const AppLayout = () => {
  return (
    <div>
      <aside>
        <h1>JobFolio</h1>

        <nav>
          <NavLink to='/dashboard'>Dashboard</NavLink>
          <NavLink to='/applications'>Applications</NavLink>
          <NavLink to='/profile'>Profile</NavLink>
        </nav>
      </aside>

      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
