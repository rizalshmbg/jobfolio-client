import { SidebarTrigger } from '@/components/ui/sidebar';
import { ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { useAuthStore } from '@stores/auth.store';

const AppHeader = () => {
  const { pathname } = useLocation();
  const user = useAuthStore((state) => state.user);
  const section = pathname.startsWith('/applications')
    ? 'Applications'
    : pathname === '/profile'
      ? 'My profile'
      : 'Overview';

  return (
    <header className='app-header'>
      <div className='flex items-center gap-3'>
        <SidebarTrigger />
        <span className='mx-1 h-4 w-px bg-border' />
        <span className='hidden text-xs text-muted-foreground sm:inline'>
          Workspace
        </span>
        <ChevronRight
          size={13}
          className='hidden text-muted-foreground sm:block'
        />
        <span className='text-xs font-medium'>{section}</span>
      </div>
      <div className='flex items-center gap-5'>
        <span className='hidden text-xs text-muted-foreground md:inline'>
          {new Intl.DateTimeFormat('en', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }).format(new Date())}
        </span>
        <Link
          to='/profile'
          className='avatar size-8 text-xs'
          aria-label='View your profile'
        >
          {user?.name.slice(0, 1).toUpperCase() || 'J'}
        </Link>
      </div>
    </header>
  );
};

export default AppHeader;
