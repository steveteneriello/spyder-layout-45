
import { ChevronUp, LogOut, Settings, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import React from 'react';
import { cn } from '@/lib/utils';

interface User {
  name?: string;
  email?: string;
  image?: string;
}

interface ProfileDropdownProps {
  user: User;
  className?: string;
  sidebarOpen?: boolean;
  onLogout: () => void;
}

export function ProfileDropdown({ user, className, sidebarOpen, onLogout }: ProfileDropdownProps) {
  const [open, setOpen] = React.useState(false);

  if (!user) return null;

  const { name, email, image } = user;

  return (
    <div className={cn('w-auto', className)}>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <div className="">
            <Button
              variant="ghost"
              style={{
                padding: sidebarOpen ? '0.375rem' : '0.375rem',
                backgroundColor: 'transparent',
                boxShadow: 'none',
              }}
              className={`h-full w-full align-center group/profiledrop ${
                sidebarOpen ? 'text-left justify-between' : 'text-center items-center justify-center w-auto'
              }`}
            >
              <div className={`flex items-center gap-[6px] ${sidebarOpen ? '' : 'justify-center'}`}>
                <Avatar className="h-8 w-8 group-hover/profiledrop:opacity-75">
                  <AvatarImage src={image || undefined} alt={name || 'User'} />
                  <AvatarFallback>{name ? name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                </Avatar>

                <div
                  className={`flex flex-col px-2 py-1 items-start overflow-hidden rounded-lg transition-opacity duration-300
                    ${sidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}
                >
                  <span className="text-sm font-semibold truncate max-w-[150px] tracking-wide group-hover/profiledrop:text-muted-foreground">
                    {name}
                  </span>
                  <span className="text-xs text-muted-foreground truncate max-w-[150px] group-hover/profiledrop:text-muted-foreground/80">
                    {email}
                  </span>
                </div>
              </div>
              {sidebarOpen ? (
                <ChevronUp
                  className={`float-right mx-2 opacity-0 ${
                    sidebarOpen ? 'group-hover/profiledrop:opacity-100' : ''
                  }`}
                />
              ) : null}
            </Button>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[15rem] tracking-wide">
          <DropdownMenuItem asChild>
            <Button variant="ghost" className="w-full justify-start" onClick={() => setOpen(false)}>
              <User className="mr-1 h-4 w-4" />
              Profile
            </Button>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Button variant="ghost" className="w-full justify-start" onClick={() => setOpen(false)}>
              <Settings className="mr-1 h-4 w-4" />
              Settings
            </Button>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                onLogout();
                setOpen(false);
              }}
            >
              <LogOut className="mr-1 h-4 w-4" />
              Log out
            </Button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
