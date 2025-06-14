
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
      color: '#64748b'
    },
    {
      title: 'Total Categories',
      value: stats.totalCategories,
      icon: FolderOpen,
      color: '#64748b'
    },
    {
      title: 'Total Keywords',
      value: stats.totalKeywords,
      icon: Hash,
      color: '#64748b'
    },
    {
      title: 'Total Negative Keywords',
      value: stats.totalNegativeKeywords,
      icon: Minus,
      color: '#64748b'
    }
  ];

  if (loading) {
    return (
      <div style={{ backgroundColor: '#1e293b' }} className="p-6 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ backgroundColor: '#0f172a', borderColor: '#475569' }} className="border rounded-lg">
              <div className="p-6">
                <div className="animate-pulse">
                  <div style={{ backgroundColor: '#475569' }} className="h-4 rounded w-3/4 mb-2"></div>
                  <div style={{ backgroundColor: '#475569' }} className="h-8 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#1e293b' }} className="p-6 rounded-lg mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div 
              key={index} 
              style={{ backgroundColor: '#0f172a', borderColor: '#475569' }} 
              className="border rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex flex-row items-center justify-between space-y-0 pb-2 p-6">
                <div className="text-sm font-medium" style={{ color: '#cbd5e1' }}>
                  {card.title}
                </div>
                <Icon className="h-4 w-4" style={{ color: card.color }} />
              </div>
              <div className="px-6 pb-6">
                <div className="text-2xl font-bold" style={{ color: '#f8fafc' }}>
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
