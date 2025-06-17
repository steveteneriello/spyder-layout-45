
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
import { useGlobalTheme } from '@/contexts/GlobalThemeContext';
import BrandHeader from '@/components/BrandHeader';

interface SidebarLayoutProps {
  children: React.ReactNode;
  nav?: React.ReactNode;
  category?: React.ReactNode;
  footer?: React.ReactNode;
  menuItems?: any[];
}

function SidebarLayoutInner({ children, nav, category, footer }: SidebarLayoutProps) {
  const { open } = useSidebar();
  const { colors, actualTheme } = useGlobalTheme();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cursorRef = useRef<HTMLDivElement>(null);

  // Apply sidebar colors from theme
  useEffect(() => {
    const sidebarBg = colors['sidebar-background'] 
      ? `rgb(${colors['sidebar-background'][actualTheme]})` 
      : (actualTheme === 'dark' ? 'rgb(15, 23, 42)' : 'rgb(0, 0, 0)');
    
    const sidebarFg = colors['sidebar-foreground']
      ? `rgb(${colors['sidebar-foreground'][actualTheme]})`
      : (actualTheme === 'dark' ? 'rgb(240, 246, 252)' : 'rgb(255, 255, 255)');

    // Apply colors to sidebar
    const sidebarElements = document.querySelectorAll('[data-sidebar="sidebar"]');
    sidebarElements.forEach((element: Element) => {
      const htmlElement = element as HTMLElement;
      htmlElement.style.backgroundColor = sidebarBg;
      htmlElement.style.color = sidebarFg;
    });
  }, [colors, actualTheme]);

  // Mouse tracking for animations
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Dynamic sidebar background color
  const sidebarBg = colors['sidebar-background'] 
    ? `rgb(${colors['sidebar-background'][actualTheme]})` 
    : (actualTheme === 'dark' ? 'rgb(15, 23, 42)' : 'rgb(0, 0, 0)');

  const sidebarFg = colors['sidebar-foreground']
    ? `rgb(${colors['sidebar-foreground'][actualTheme]})`
    : (actualTheme === 'dark' ? 'rgb(240, 246, 252)' : 'rgb(255, 255, 255)');

  return (
    <div className="flex min-h-screen">
      {/* Custom Cursor */}
      <div
        ref={cursorRef}
        className="fixed pointer-events-none z-50 w-4 h-4 rounded-full bg-white/20 backdrop-blur-sm transition-all duration-150 ease-out"
        style={{
          left: mousePosition.x - 8,
          top: mousePosition.y - 8,
        }}
      />

      <Sidebar 
        className="border-r-0"
        style={{ backgroundColor: sidebarBg, color: sidebarFg }}
      >
        <SidebarContent 
          className="relative overflow-hidden"
          style={{ backgroundColor: sidebarBg, color: sidebarFg }}
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10">
            {nav || <BrandHeader />}
          </div>

          {/* Category Navigation */}
          <div className="flex-1 overflow-y-auto p-4">
            {category}
          </div>

          {/* Sidebar Footer */}
          {footer && (
            <div className="mt-auto p-4 border-t border-white/10">
              {footer}
            </div>
          )}
        </SidebarContent>

        <SidebarFooter style={{ backgroundColor: sidebarBg }}>
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="px-4 py-2 text-center">
                <div className="text-xs text-white/60">
                  Powered by{' '}
                  <span className="text-white/80 font-medium">Oxylabs</span>
                </div>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      {/* Main Content */}
      <main 
        className={cn(
          "flex-1 transition-all duration-300 ease-in-out relative",
          "bg-background text-foreground"
        )}
      >
        {children}
      </main>
    </div>
  );
}

export default function SidebarLayout(props: SidebarLayoutProps) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <SidebarLayoutInner {...props} />
      </SidebarProvider>
    </TooltipProvider>
  );
}
