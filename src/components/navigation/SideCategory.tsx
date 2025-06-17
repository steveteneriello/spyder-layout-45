import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { 
  Home, User, Settings, FileText, BarChart, Target, Calendar, Plus, MapPin, 
  Palette, Bug, Monitor, Layout, Image, Eye, Download, Upload 
} from 'lucide-react';

// Available icons
const iconMap = {
  Home, User, Settings, FileText, BarChart, Target, Calendar, Plus, MapPin, 
  Palette, Bug, Monitor, Layout, Image, Eye, Download, Upload
};

interface SideCategoryProps {
  section: string;
  items: any[];
}

export function SideCategory({ section, items }: SideCategoryProps) {
  const location = useLocation();

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <Collapsible defaultOpen>
      <SidebarGroup>
        <CollapsibleTrigger asChild>
          <SidebarGroupLabel className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            {section}
            <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
          </SidebarGroupLabel>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const IconComponent = iconMap[item.icon as keyof typeof iconMap] || FileText;
                const isActive = location.pathname === item.path;
                
                return (
                  <SidebarMenuItem key={item.id || item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className="group/item"
                    >
                      <Link to={item.path}>
                        <IconComponent className="h-4 w-4" />
                        <span>{item.title}</span>
                        {item.badge && (
                          <Badge 
                            variant="secondary" 
                            className={`ml-auto h-5 text-xs ${item.badge.color || 'bg-blue-100 text-blue-800'}`}
                          >
                            {item.badge.text}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}

export default SideCategory;
