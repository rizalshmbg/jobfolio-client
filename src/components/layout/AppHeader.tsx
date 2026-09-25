import { SidebarTrigger } from '@/components/ui/sidebar';

const AppHeader = () => {
  return (
    <header className='flex h-16 items-center border-b px-4'>
      <SidebarTrigger />
    </header>
  );
};

export default AppHeader;
