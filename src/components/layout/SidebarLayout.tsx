
import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useGlobalTheme } from '@/contexts/GlobalThemeContext';
import { BrandLogo } from '@/components/ui/brand-logo';
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
import { ChevronRight, Home } from 'lucide-react';

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

// ADDED: Brand Header Component
function BrandHeader() {
  const { actualTheme, colors } = useGlobalTheme();

  const sidebarText = colors['sidebar-foreground']
    ? `rgb(${colors['sidebar-foreground'][actualTheme]})`
    : 'rgb(255, 255, 255)';

  return (
    <BrandLogo 
      size="md" 
      showText={true} 
      textColor={sidebarText}
      className="flex items-center gap-3"
    />
  );
}

function AppSidebar({ menuItems, category, footer }: SidebarProps) {
  const { open, toggleSidebar } = useSidebar();
  const { colors, actualTheme } = useGlobalTheme();

  // FIXED: Dynamic sidebar colors based on theme
  const sidebarBg = colors['sidebar-background'] 
    ? `rgb(${colors['sidebar-background'][actualTheme]})` 
    : actualTheme === 'dark' ? 'rgb(15, 23, 42)' : 'rgb(0, 0, 0)';

  const sidebarText = colors['sidebar-foreground']
    ? `rgb(${colors['sidebar-foreground'][actualTheme]})`
    : 'rgb(255, 255, 255)';

  return (
    <Sidebar 
      side="left" 
      className="h-[calc(100vh-4rem)] mt-[4rem]"
      style={{ backgroundColor: sidebarBg }}
    >
      <SidebarContent 
        className="overflow-hidden pt-6"
        style={{ backgroundColor: sidebarBg, color: sidebarText }}
      >
        {/* Use the category prop which contains the properly structured menu */}
        {category}
      </SidebarContent>

      <SidebarFooter
        className={`transition-all duration-200 ease-in-out overflow-hidden ${
          open ? 'items-start' : 'items-center'
        }`}
        style={{ backgroundColor: sidebarBg }}
      >
        <SidebarMenu className="w-full">
          <SidebarMenuItem>
            <div
              className={`flex pb-0 items-center ${
                open ? 'justify-end' : 'justify-center'
              }`}
            >
              <div
                className="group p-2 rounded transition-all duration-200 ease-in-out cursor-pointer"
                style={{ 
                  backgroundColor: `rgb(${colors['sidebar-accent']?.[actualTheme] || '55, 65, 81'})`,
                  color: sidebarText
                }}
                onClick={toggleSidebar}
              >
                <ChevronRight
                  size={15}
                  className={`transition-all duration-200 ease-in-out ${
                    open ? 'rotate-180' : 'rotate-0'
                  }`}
                  style={{ color: sidebarText }}
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
  const { colors, actualTheme } = useGlobalTheme();
  
  // FIXED: Dynamic header colors based on theme
  const headerBg = colors['sidebar-background'] 
    ? `rgb(${colors['sidebar-background'][actualTheme]})` 
    : actualTheme === 'dark' ? 'rgb(15, 23, 42)' : 'rgb(0, 0, 0)';

  const headerText = colors['sidebar-foreground']
    ? `rgb(${colors['sidebar-foreground'][actualTheme]})`
    : 'rgb(255, 255, 255)';
  
  return (
    <div 
      className="flex top-0 w-full min-h-[4rem] z-20 items-center fixed"
      style={{ backgroundColor: headerBg, color: headerText }}
    >
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
  const { actualTheme } = useGlobalTheme();

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

  // ENHANCED: Default nav with brand settings integration
  const defaultNav = nav || (
    <div className="flex items-center justify-between w-full px-4">
      <BrandHeader />
      <div className="text-white text-sm">
        Theme: {actualTheme}
      </div>
    </div>
  );

  return (
    <div
      ref={btnRef}
      className={cn(
        'sidebar-layout flex flex-col h-screen w-full bg-background',
        'mouse-cursor-gradient-tracking',
        isActive && 'active',
        isPulsing && 'pulse-effect'
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={cn('h-full w-full', className)}>
        <SidebarProvider>
          <div className="sidebar-layout-nav">
            <Nav>{defaultNav}</Nav>
          </div>
          <div className="flex flex-1 mt-16 w-full h-[calc(100vh-4rem)]">
            <TooltipProvider delayDuration={300} skipDelayDuration={0}>
              <AppSidebar menuItems={menuItems} category={category} footer={footer} />
              <div className="flex flex-col flex-1 overflow-hidden relative h-full">
                {/* FIXED: Use proper theme-aware background */}
                <main className="flex-1 overflow-y-auto p-0 h-full bg-background">
                  <div className="main-body w-full h-full">{children}</div>
                </main>
              </div>
            </TooltipProvider>
          </div>
        </SidebarProvider>
      </div>

      {/* Theme-aware sidebar styling */}
      <style>{`
        /* Custom sidebar styling using theme variables */
        .sidebar-layout [data-sidebar] {
          background-color: hsl(var(--sidebar-background)) !important;
          border-color: hsl(var(--sidebar-border)) !important;
          color: hsl(var(--sidebar-text)) !important;
        }
        
        .sidebar-layout [data-sidebar-menu-button] {
          color: hsl(var(--sidebar-text)) !important;
          transition: all 0.2s ease-in-out;
        }
        
        .sidebar-layout [data-sidebar-menu-button]:hover {
          background-color: hsl(var(--sidebar-hover)) !important;
          color: hsl(var(--sidebar-text-active)) !important;
        }
        
        .sidebar-layout [data-sidebar-menu-button][data-active="true"] {
          background-color: hsl(var(--sidebar-active)) !important;
          color: hsl(var(--sidebar-text-active)) !important;
        }
        
        .sidebar-layout [data-sidebar-group-label] {
          color: hsl(var(--sidebar-text)) !important;
          transition: all 0.2s ease-in-out;
        }
        
        .sidebar-layout [data-sidebar-group-label]:hover {
          background-color: hsl(var(--sidebar-hover)) !important;
          color: hsl(var(--sidebar-text-active)) !important;
        }
        
        /* Remove secondary hover effects */
        .sidebar-layout .group {
          background-color: transparent !important;
        }
        
        .sidebar-layout .group:hover {
          background-color: transparent !important;
          opacity: 1 !important;
        }
        
        /* Header styling */
        .sidebar-layout-nav {
          background-color: hsl(var(--header-background)) !important;
          color: hsl(var(--header-text)) !important;
        }
      `}</style>
    </div>
  );
}
