
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CampaignList } from './CampaignList';
import { CampaignEditor } from './CampaignEditor';
import { CampaignWorkflow } from './CampaignWorkflow';
import { CampaignDashboard } from './CampaignDashboard';
import { CampaignFilters } from './CampaignFilters';
import { useCampaigns } from '@/hooks/useCampaigns';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type View = 'list' | 'editor' | 'workflow';

export function CampaignDesigner() {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>('list');
  const [activeTab, setActiveTab] = useState('campaigns');
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  const { campaigns, loading, totalCount, totalPages, refetch } = useCampaigns({
    searchTerm,
    statusFilter,
    categoryFilter,
    page: currentPage,
    pageSize: 12
  });

  console.log('CampaignDesigner - campaigns:', campaigns, 'loading:', loading);

  const handleSelectCampaign = (campaignId: string) => {
    setSelectedCampaignId(campaignId);
    setCurrentView('list');
  };

  const handleEditCampaign = (campaignId: string) => {
    setSelectedCampaignId(campaignId);
    setActiveTab('editor');
    setCurrentView('editor');
  };

  const handleAddCampaign = () => {
    setCurrentView('workflow');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setActiveTab('campaigns');
    refetch();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const showEllipsis = totalPages > 7;
    
    if (showEllipsis) {
      // Show first page
      pages.push(1);
      
      // Show ellipsis if current page is far from start
      if (currentPage > 4) {
        pages.push('ellipsis-start');
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Show ellipsis if current page is far from end
      if (currentPage < totalPages - 3) {
        pages.push('ellipsis-end');
      }
      
      // Show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    } else {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    }

    return (
      <Pagination className="mt-6">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              className={`${currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} hover:bg-accent hover:text-accent-foreground`}
            />
          </PaginationItem>
          
          {pages.map((page, index) => {
            if (typeof page === 'string') {
              return (
                <PaginationItem key={index}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }
            
            return (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => handlePageChange(page)}
                  isActive={currentPage === page}
                  className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              className={`${currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'} hover:bg-accent hover:text-accent-foreground`}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  if (currentView === 'workflow') {
    return (
      <CampaignWorkflow onBack={handleBackToList} />
    );
  }

  return (
    <div className="space-y-6 min-h-screen" style={{ backgroundColor: '#121212', color: '#E0E0E0' }}>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold" style={{ color: '#E0E0E0' }}>Campaign Manager</h1>
      </div>

      <CampaignDashboard />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList style={{ backgroundColor: '#444444', borderColor: '#444444' }}>
          <TabsTrigger 
            value="campaigns" 
            className="data-[state=active]:bg-[#888888] data-[state=active]:text-[#E0E0E0]"
            style={{ color: '#E0E0E0' }}
          >
            Campaigns
          </TabsTrigger>
          <TabsTrigger 
            value="editor" 
            disabled={!selectedCampaignId}
            className="data-[state=active]:bg-[#888888] data-[state=active]:text-[#E0E0E0] disabled:text-[#B0B0B0]"
            style={{ color: '#E0E0E0' }}
          >
            Campaign Editor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          <CampaignFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            totalResults={totalCount}
          />
          
          <CampaignList 
            campaigns={campaigns}
            loading={loading}
            onSelectCampaign={handleSelectCampaign}
            selectedCampaignId={selectedCampaignId}
            onAddCampaign={handleAddCampaign}
            onEditCampaign={handleEditCampaign}
            onRefresh={refetch}
          />
          
          {renderPagination()}
        </TabsContent>

        <TabsContent value="editor" className="space-y-4">
          {selectedCampaignId && (
            <CampaignEditor campaignId={selectedCampaignId} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
