
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
      color: 'text-green-500 dark:text-green-400'
    },
    {
      title: 'Total Categories',
      value: stats.totalCategories,
      icon: FolderOpen,
      color: 'text-blue-500 dark:text-blue-400'
    },
    {
      title: 'Total Keywords',
      value: stats.totalKeywords,
      icon: Hash,
      color: 'text-purple-500 dark:text-purple-400'
    },
    {
      title: 'Total Negative Keywords',
      value: stats.totalNegativeKeywords,
      icon: Minus,
      color: 'text-red-500 dark:text-red-400'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {dashboardCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="bg-card border-border hover:shadow-md transition-shadow dark:hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">{card.value.toLocaleString()}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
