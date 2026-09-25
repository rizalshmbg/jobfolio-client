import { BriefcaseBusiness, LayoutDashboard, User, LogOut } from 'lucide-react';
import { NavLink, useLocation } from 'react-router';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

type AppSidebarProps = {
  username?: string;
  isLoggingOut: boolean;
  onLogout: () => void;
};

const navigationItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Applications',
    url: '/applications',
    icon: BriefcaseBusiness,
  },
  {
    title: 'Profile',
    url: '/profile',
    icon: User,
  },
];

const AppSidebar = ({ username, isLoggingOut, onLogout }: AppSidebarProps) => {
  const location = useLocation();

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader>
        <div className='flex h-12 items-center px-2'>
          <span className='text-lg font-semibold'>JobFolio</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const isActive =
                  item.url === '/applications'
                    ? location.pathname.startsWith('/applications')
                    : location.pathname === item.url;

                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      render={<NavLink to={item.url} />}
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {username && (
          <div className='px-2 py-1'>
            <p className='truncate text-sm font-medium'>{username}</p>
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={onLogout}
              disabled={isLoggingOut}
              tooltip='Logout'
            >
              <LogOut />
              <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
