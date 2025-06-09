
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Home, User, Settings, FileText, BarChart } from 'lucide-react';

interface MenuItem {
  title: string;
  path: string;
  icon: string;
}

interface SideCategoryProps {
  section: string;
  items: MenuItem[];
}

const getIcon = (iconName: string) => {
  const iconMap: Record<string, any> = {
    Home,
    User,
    Settings,
    FileText,
    BarChart,
  };
  return iconMap[iconName] || Home;
};

export function SideCategory({ section, items }: SideCategoryProps) {
  return (
    <Collapsible key={section} defaultOpen className="group/collapsible">
      <SidebarGroup>
        <SidebarGroupLabel asChild className="justify-between">
          <CollapsibleTrigger className="flex w-full items-center gap-2">
            {section}
            <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu className="transition-all duration-200 ease-in-out">
              {items.map((item) => {
                const IconComponent = getIcon(item.icon);
                return (
                  <SidebarMenuItem key={`${section}-${item.title}`}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton asChild>
                          <a
                            href={item.path}
                            className="flex gap-2 transition-all duration-200 ease-in-out"
                          >
                            <IconComponent size={20} />
                            <span className="transition-all duration-200 ease-in-out">
                              {item.title}
                            </span>
                          </a>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent side="right" sideOffset={25}>
                        <p>{item.title}</p>
                      </TooltipContent>
                    </Tooltip>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarGroup>
    </Collapsible>
  );
}
