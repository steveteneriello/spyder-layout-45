import React from 'react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGlobalTheme } from '@/contexts/GlobalThemeContext';
import { Building, ChevronsUpDown, Check, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Company {
  company_id: string;
  name: string;
  domain: string;
  logo?: string;
  plan?: 'free' | 'pro' | 'enterprise';
  users?: number;
}

interface CompanySelectorProps {
  className?: string;
  isExpanded?: boolean;
  companies: Company[];
  selectedCompany?: Company;
  onSelectCompany: (companyId: string) => void;
  variant?: 'sidebar' | 'header' | 'inline';
}

export function CompanySelector({
  className,
  isExpanded = true,
  companies,
  selectedCompany,
  onSelectCompany,
  variant = 'sidebar',
}: CompanySelectorProps) {
  const { actualTheme, colors } = useGlobalTheme();

  // FIXED: Theme-aware styling based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case 'sidebar':
        return {
          button: 'bg-transparent border-none text-white hover:bg-white/10 hover:text-white',
          icon: 'text-white/80',
          text: 'text-white',
          subtext: 'text-white/60',
        };
      case 'header':
        return {
          button: 'bg-transparent border-border text-foreground hover:bg-accent',
          icon: 'text-muted-foreground',
          text: 'text-foreground',
          subtext: 'text-muted-foreground',
        };
      case 'inline':
        return {
          button: 'bg-background border-border text-foreground hover:bg-accent',
          icon: 'text-muted-foreground',
          text: 'text-foreground',
          subtext: 'text-muted-foreground',
        };
      default:
        return {
          button: 'bg-transparent border-none text-foreground hover:bg-accent',
          icon: 'text-muted-foreground',
          text: 'text-foreground',
          subtext: 'text-muted-foreground',
        };
    }
  };

  const styles = getVariantStyles();

  const getPlanBadgeColor = (plan?: string) => {
    switch (plan) {
      case 'enterprise':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'pro':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'free':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCompanyInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={cn('w-auto', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-label="Select company"
            className={cn(
              'flex items-center justify-between w-full h-auto p-3 transition-all duration-200',
              styles.button
            )}
          >
            <div className="flex items-center gap-3">
              {/* Company Icon/Avatar */}
              <div className="relative">
                {selectedCompany?.logo ? (
                  <img 
                    src={selectedCompany.logo} 
                    alt={selectedCompany.name}
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                ) : (
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold',
                    variant === 'sidebar' 
                      ? 'bg-white/20 text-white' 
                      : 'bg-primary/10 text-primary'
                  )}>
                    {selectedCompany ? getCompanyInitials(selectedCompany.name) : (
                      <Building className="h-4 w-4" />
                    )}
                  </div>
                )}
                
                {/* Online indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>

              {/* Company Info */}
              {isExpanded && (
                <div className="flex flex-col items-start overflow-hidden min-w-0 flex-1">
                  <div className="flex items-center gap-2 w-full">
                    <span className={cn('text-sm font-semibold leading-none truncate', styles.text)}>
                      {selectedCompany ? selectedCompany.name : 'Select Company'}
                    </span>
                    {selectedCompany?.plan && (
                      <Badge 
                        variant="outline" 
                        className={cn('text-xs px-1.5 py-0', getPlanBadgeColor(selectedCompany.plan))}
                      >
                        {selectedCompany.plan.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 w-full">
                    <span className={cn('text-xs truncate max-w-[120px]', styles.subtext)}>
                      {selectedCompany
                        ? selectedCompany.domain
                        : `${companies ? companies.length : '0'} available`}
                    </span>
                    {selectedCompany?.users && (
                      <span className={cn('text-xs flex items-center gap-1', styles.subtext)}>
                        <Users className="h-3 w-3" />
                        {selectedCompany.users}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Dropdown Arrow */}
            {isExpanded && (
              <ChevronsUpDown className={cn('h-4 w-4 flex-shrink-0 ml-2', styles.icon)} />
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent 
          className="w-[18rem] max-h-[400px] overflow-y-auto"
          align="start"
          side="bottom"
        >
          <DropdownMenuLabel className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Available Companies
            {companies?.length > 0 && (
              <Badge variant="outline" className="ml-auto">
                {companies.length}
              </Badge>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {companies && companies.length > 0 ? (
            companies.map((company) => (
              <DropdownMenuItem
                key={company.company_id}
                onSelect={() => {
                  onSelectCompany(company.company_id);
                }}
                className="p-3 cursor-pointer"
              >
                <div className="flex items-center gap-3 w-full">
                  {/* Company Avatar */}
                  {company.logo ? (
                    <img 
                      src={company.logo} 
                      alt={company.name}
                      className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {getCompanyInitials(company.name)}
                    </div>
                  )}
                  
                  {/* Company Details */}
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">
                        {company.name}
                      </span>
                      {company.plan && (
                        <Badge 
                          variant="outline" 
                          className={cn('text-xs px-1.5 py-0', getPlanBadgeColor(company.plan))}
                        >
                          {company.plan.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground truncate">
                        {company.domain}
                      </span>
                      {company.users && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {company.users}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Selected Indicator */}
                  {selectedCompany?.company_id === company.company_id && (
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  )}
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem disabled className="p-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building className="h-4 w-4" />
                <span>No companies available</span>
              </div>
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          {/* Footer Actions */}
          <DropdownMenuItem className="p-3 cursor-pointer text-primary">
            <div className="flex items-center gap-2 w-full">
              <Building className="h-4 w-4" />
              <span className="text-sm">Manage Companies</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}