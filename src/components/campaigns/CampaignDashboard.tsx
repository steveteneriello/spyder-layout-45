
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, FolderOpen, Hash, Minus } from 'lucide-react';
import { useCampaignStats } from '@/hooks/useCampaignStats';

export function CampaignDashboard() {
  const { stats, loading } = useCampaignStats();

  const dashboardCards = [
    {
      title: 'Total Active Campaigns',
      value: stats.totalActiveCampaigns,
      icon: Target,
      color: 'campaign-accent'
    },
    {
      title: 'Total Categories',
      value: stats.totalCategories,
      icon: FolderOpen,
      color: 'campaign-accent'
    },
    {
      title: 'Total Keywords',
      value: stats.totalKeywords,
      icon: Hash,
      color: 'campaign-accent'
    },
    {
      title: 'Total Negative Keywords',
      value: stats.totalNegativeKeywords,
      icon: Minus,
      color: 'campaign-accent'
    }
  ];

  if (loading) {
    return (
      <div className="p-6 rounded-lg mb-6 campaign-secondary-bg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border rounded-lg campaign-card-bg campaign-border">
              <div className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 rounded w-3/4 mb-2 campaign-border bg-current opacity-20"></div>
                  <div className="h-8 rounded w-1/2 campaign-border bg-current opacity-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-lg mb-6 campaign-secondary-bg">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div 
              key={index} 
              className="border rounded-lg hover:shadow-md transition-shadow campaign-card-bg campaign-border"
            >
              <div className="flex flex-row items-center justify-between space-y-0 pb-2 p-6">
                <div className="text-sm font-medium campaign-secondary-text">
                  {card.title}
                </div>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
              <div className="px-6 pb-6">
                <div className="text-2xl font-bold campaign-primary-text">
                  {card.value.toLocaleString()}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
