import DashboardIcon from '@/assets/dashboard-svgrepo-com-2.svg?react';
import MapIcon from '@/assets/location-svgrepo-com-2.svg?react';
import myImage from '@/assets/sager_log.svg';

import { Sidebar, SidebarContent, SidebarGroup, SidebarHeader, SidebarRail, useSidebar } from '@/components/ui/sidebar';
import type { NavItem, ViewType } from '@/types';
import { useState, type JSX } from 'react';

// This is sample data.
const data = {
  navMain: [
    {
      title: 'Dashboard',
      icon: DashboardIcon,
    },
    {
      title: 'Map',
      icon: MapIcon,
    },
  ],
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onViewChange: (view: ViewType) => void;
}

export function AppSidebar({ onViewChange, ...props }: AppSidebarProps): JSX.Element {
  const [activeItem, setActiveItem] = useState<string>(data.navMain[0]?.title || '');
  const { setOpenMobile, isMobile } = useSidebar();

  const handleItemClick = (item: NavItem): void => {
    setActiveItem(item.title);

    if (item.title.toLowerCase() === 'map') {
      onViewChange('map');
    } else {
      onViewChange('dashboard');
    }

    // Close sidebar on mobile after clicking an item
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="z-[1] flex items-center p-4">
          <img src={myImage} alt="Description" loading="lazy" width="200" height="200" />
        </div>
      </SidebarHeader>
      <SidebarContent className="m-4 space-y-1">
        {data.navMain.map((item) => {
          const isActive = activeItem === item.title;

          return (
            <SidebarGroup
              key={item.title}
              className={`flex cursor-pointer flex-row items-center justify-start gap-2 transition-colors ${
                isActive ? 'bg-sidebar-accent text-sidebar-primary rounded-sm' : 'hover:bg-sidebar-accent/50 rounded-sm'
              }`}
              onClick={() => handleItemClick(item)}
            >
              <item.icon className={`h-5 w-5 ${isActive ? 'text-sidebar-accent-foreground' : ''}`} />
              <span
                className={`text-sidebar-foreground/70 ring-sidebar-ring outline-hidden flex h-8 shrink-0 items-center rounded-md px-2 text-lg font-medium transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0 [&>svg]:size-4 [&>svg]:shrink-0 ${
                  isActive ? 'text-sidebar-accent-foreground font-semibold' : ''
                }`}
              >
                {item.title}
              </span>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
