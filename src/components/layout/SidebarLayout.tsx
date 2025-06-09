
import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
  useSidebar,
} from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ChevronRight } from 'lucide-react';

interface MenuItem {
  title: string;
  path: string;
  icon?: string;
  section?: string;
}

interface SidebarLayoutProps {
  nav?: React.ReactNode;
  category?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  menuItems: MenuItem[];
  user?: any;
  navColor?: string;
  sideColor?: string;
}

interface NavProps {
  children: React.ReactNode;
  color?: string;
}

interface SidebarProps {
  menuItems: MenuItem[];
  category?: React.ReactNode;
  footer?: React.ReactNode;
  color?: string;
}

function AppSidebar({ menuItems, category, footer }: SidebarProps) {
  const { open, toggleSidebar } = useSidebar();

  const sections = menuItems.reduce((acc, item) => {
    const section = item.section || 'Other';
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <Sidebar side="left" className="h-[calc(100vh-4rem)] mt-[4rem] !bg-black">
      <SidebarContent className="overflow-hidden pt-6 !bg-black">
        {Object.entries(sections).map(([section, items], index) => (
          <div key={index} className="mb-4">
            {category}
          </div>
        ))}
      </SidebarContent>

      <SidebarFooter
        className={`transition-all duration-200 ease-in-out overflow-hidden !bg-black ${
          open ? 'items-start' : 'items-center'
        }`}
      >
        <SidebarMenu className="w-full">
          <SidebarMenuItem>
            <div
              className={`flex pb-0 items-center ${
                open ? 'justify-end' : 'justify-center'
              }`}
            >
              <div
                className="group p-2 rounded transition-all duration-200 ease-in-out bg-gray-800 text-white hover:text-white hover:opacity-75 cursor-pointer"
                onClick={toggleSidebar}
              >
                <ChevronRight
                  size={15}
                  className={`transition-all duration-200 ease-in-out text-white ${
                    open ? 'rotate-180' : 'rotate-0'
                  }`}
                />
              </div>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem className="overflow-hidden mb-3">
            {footer}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function Nav({ children }: NavProps) {
  const { open } = useSidebar();
  
  return (
    <div className="flex top-0 w-full min-h-[4rem] z-20 items-center fixed !bg-black text-white">
      {children}
    </div>
  );
}

export default function SidebarLayout({
  user,
  children,
  nav,
  category,
  footer,
  className,
  menuItems,
}: SidebarLayoutProps) {
  const btnRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const animationRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (btnRef.current && isActive) {
      const rect = btnRef.current.getBoundingClientRect();
      const targetX = e.clientX - rect.left;
      const targetY = e.clientY - rect.top;

      let currentX = parseFloat(btnRef.current.style.getPropertyValue('--x') || '50%');
      let currentY = parseFloat(btnRef.current.style.getPropertyValue('--y') || '50%');

      const animate = () => {
        if (btnRef.current) {
          currentX += (targetX - currentX) * 0.03;
          currentY += (targetY - currentY) * 0.03;

          btnRef.current.style.setProperty('--x', `${currentX}px`);
          btnRef.current.style.setProperty('--y', `${currentY}px`);

          if (isActive && (Math.abs(targetX - currentX) > 0.1 || Math.abs(targetY - currentY) > 0.1)) {
            animationRef.current = requestAnimationFrame(animate);
          }
        }
      };
      
      setTimeout(() => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        animationRef.current = requestAnimationFrame(animate);
      }, 5);
    }
  };

  const handleMouseEnter = () => {
    setIsActive(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsPulsing(true);
    }, 0);
  };

  const handleMouseLeave = () => {
    setIsPulsing(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsActive(false);
    }, 30);
  };

  return (
    <div
      ref={btnRef}
      className={cn(
        'sidebar-layout flex flex-col h-screen w-full',
        'mouse-cursor-gradient-tracking',
        isActive && 'active',
        isPulsing && 'pulse-effect'
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={cn('', className)}>
        <SidebarProvider>
          <Nav>{nav}</Nav>
          <div className="flex flex-1 mt-16 w-full">
            <TooltipProvider delayDuration={300} skipDelayDuration={0}>
              <AppSidebar menuItems={menuItems} category={category} footer={footer} />
              <div className="flex flex-col flex-1 overflow-hidden">
                <main className="flex-1 overflow-y-auto p-0 sm:p-8 bg-white rounded-tl-[20px] z-[3] relative">
                  {/* Fill the curved corner with black */}
                  <div className="absolute top-0 left-0 w-[20px] h-[20px] bg-black"></div>
                  <div className="main-body w-full h-full">{children}</div>
                </main>
              </div>
            </TooltipProvider>
          </div>
        </SidebarProvider>
      </div>
    </div>
  );
}
