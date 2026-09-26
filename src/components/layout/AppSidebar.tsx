import {
  BriefcaseBusiness,
  LayoutDashboard,
  User,
  LogOut,
  ArrowUpRight,
  Sprout,
} from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router';
import Brand from '@/components/Brand';

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
  useSidebar,
} from '@/components/ui/sidebar';

type AppSidebarProps = {
  username?: string;
  isLoggingOut: boolean;
  onLogout: () => void;
};

const navigationItems = [
  {
    title: 'Overview',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Applications',
    url: '/applications',
    icon: BriefcaseBusiness,
  },
  {
    title: 'My profile',
    url: '/profile',
    icon: User,
  },
];

const AppSidebar = ({ username, isLoggingOut, onLogout }: AppSidebarProps) => {
  const location = useLocation();
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <Sidebar collapsible='icon' className='workspace-sidebar'>
      <SidebarHeader className='px-5 py-6 group-data-[collapsible=icon]:px-2'>
        <div className='sidebar-brand'>
          <Brand />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className='px-4 group-data-[collapsible=icon]:px-2'>
          <SidebarGroupLabel className='eyebrow mb-3'>
            Workspace
          </SidebarGroupLabel>

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
                      render={
                        <NavLink
                          to={item.url}
                          onClick={() => {
                            if (isMobile) setOpenMobile(false);
                          }}
                        />
                      }
                      isActive={isActive}
                      tooltip={item.title}
                      className='h-11 gap-3 rounded-lg px-3 text-[13px] data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-semibold'
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

      <SidebarFooter className='gap-4 p-4 group-data-[collapsible=icon]:p-2'>
        <div className='sidebar-tip group-data-[collapsible=icon]:hidden'>
          <Sprout size={23} />
          <p>Small steps. Big possibilities.</p>
          <span>Every application is a step toward your next chapter.</span>
          <Link
            to='/applications/new'
            onClick={() => {
              if (isMobile) setOpenMobile(false);
            }}
          >
            Make your next move
            <ArrowUpRight size={14} />
          </Link>
        </div>
        {username && (
          <div className='flex items-center gap-3 border-t px-1 pt-5 group-data-[collapsible=icon]:hidden'>
            <span className='avatar'>{username.slice(0, 1).toUpperCase()}</span>
            <div className='min-w-0'>
              <p className='truncate text-sm font-medium'>{username}</p>
              <p className='mt-0.5 text-xs text-muted-foreground'>
                Personal workspace
              </p>
            </div>
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={onLogout}
              disabled={isLoggingOut}
              tooltip='Log out'
            >
              <LogOut />
              <span>{isLoggingOut ? 'Logging out...' : 'Log out'}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
