
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
import { Building, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Company {
  company_id: string;
  name: string;
  domain: string;
}

interface CompanySelectorProps {
  className?: string;
  isExpanded?: boolean;
  companies: Company[];
  selectedCompany?: Company;
  onSelectCompany: (companyId: string) => void;
}

export function CompanySelector({
  className,
  isExpanded = true,
  companies,
  selectedCompany,
  onSelectCompany,
}: CompanySelectorProps) {
  return (
    <div className={cn('w-auto', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-label="Select company"
            className="flex items-center bg-transparent border-none justify-between w-full h-auto p-2 hover:bg-transparent hover:opacity-75 hover:text-accent-foreground"
          >
            <div className="flex items-center gap-2">
              <span className="bg-secondary p-2 rounded-sm">
                <Building className="h-4 w-4" />
              </span>
              {isExpanded && (
                <div className="flex flex-col items-start overflow-hidden">
                  <span className="text-sm font-medium leading-none">
                    {selectedCompany ? selectedCompany.name : 'Select Company'}
                  </span>
                  <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                    {selectedCompany
                      ? selectedCompany.domain
                      : `You have ${companies ? companies.length : '0'} available`}
                  </span>
                </div>
              )}
            </div>
            {isExpanded && <ChevronsUpDown className="h-4 w-4 opacity-50" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[15rem] max-h-[400px] overflow-y-auto">
          <DropdownMenuLabel>Available Companies</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {companies && companies.length > 0 ? (
            companies.map((company) => (
              <DropdownMenuItem
                key={company.company_id}
                onSelect={() => {
                  onSelectCompany(company.company_id);
                }}
              >
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  <div className="flex flex-col">
                    <span className="text-sm">{company.name}</span>
                    <span className="text-xs text-muted-foreground">{company.domain}</span>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem disabled>No companies available</DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
