import Bell from '@/assets/bell.svg?react';
import Capture from '@/assets/capture-svgrepo-com.svg?react';
import Globe from '@/assets/language-svgrepo-com.svg?react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, Settings, User } from 'lucide-react';
import { SidebarTrigger } from '../ui/sidebar';

export function Header() {
  return (
    <header className="flex items-center justify-between bg-black px-4 py-3 text-white md:px-6">
      <SidebarTrigger className="-ml-1" />
      {/* Right side icons and user info */}
      <div className="flex items-center gap-2 md:gap-4">
        <Button variant="ghost" size="icon" className="hover:bg-accent-foreground hidden text-white md:flex">
          <Capture className="h-5 w-5" />
        </Button>

        <Button variant="ghost" size="icon" className="hover:bg-accent-foreground hidden text-white md:flex">
          <Globe className="h-5 w-5" />
        </Button>

        {/* Notifications - always visible */}
        <div className="relative">
          <Button variant="ghost" size="icon" className="hover:bg-accent-foreground text-white">
            <Bell className="h-4 w-4 md:h-5 md:w-5" />
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-xs text-white md:h-5 md:w-5 md:text-xs">
              8
            </span>
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2 text-white">
              <User className="h-4 w-4 md:h-5 md:w-5" />
              <div className="hidden text-left sm:block">
                <div className="text-sm font-medium">Hello, Mohammed Omar</div>
                <div className="text-xs text-gray-300">Technical Support</div>
              </div>
              <div className="block text-left sm:hidden">
                <div className="text-xs font-medium">M. Omar</div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-gray-800 md:hidden">
              <Menu className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Capture
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Globe className="mr-2 h-4 w-4" />
              Language
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
