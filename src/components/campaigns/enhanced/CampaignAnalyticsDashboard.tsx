import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  MousePointer, 
  Eye,
  Users,
  Phone,
  Calendar,
  RefreshCw,
  Download,
  Filter
} from 'lucide-react';
import type { Campaign } from '@/hooks/useCampaignManagement';

interface CampaignMetrics {
  campaignId: string;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cost: number;
  conversions: number;
  conversionRate: number;
  costPerConversion: number;
  calls: number;
  callRate: number;
  roas: number;
}

interface CampaignAnalyticsDashboardProps {
  campaigns: Campaign[];
  dateRange: string;
  onDateRangeChange: (range: string) => void;
}

const SAMPLE_METRICS: CampaignMetrics[] = [
  {
    campaignId: '1',
    impressions: 15420,
    clicks: 842,
    ctr: 5.46,
    cpc: 2.15,
    cost: 1810.30,
    conversions: 34,
    conversionRate: 4.04,
    costPerConversion: 53.24,
    calls: 28,
    callRate: 3.33,
    roas: 4.2
  },
  {
    campaignId: '2',
    impressions: 8930,
    clicks: 456,
    ctr: 5.11,
    cpc: 1.89,
    cost: 861.84,
    conversions: 19,
    conversionRate: 4.17,
    costPerConversion: 45.36,
    calls: 15,
    callRate: 3.29,
    roas: 3.8
  }
];

export function CampaignAnalyticsDashboard({ 
  campaigns, 
  dateRange, 
  onDateRangeChange 
}: CampaignAnalyticsDashboardProps) {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all');
  const [metrics, setMetrics] = useState<CampaignMetrics[]>(SAMPLE_METRICS);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate aggregate metrics
  const aggregateMetrics = metrics.reduce((acc, metric) => ({
    impressions: acc.impressions + metric.impressions,
    clicks: acc.clicks + metric.clicks,
    cost: acc.cost + metric.cost,
    conversions: acc.conversions + metric.conversions,
    calls: acc.calls + metric.calls
  }), { impressions: 0, clicks: 0, cost: 0, conversions: 0, calls: 0 });

  const avgCtr = aggregateMetrics.clicks / aggregateMetrics.impressions * 100;
  const avgCpc = aggregateMetrics.cost / aggregateMetrics.clicks;
  const conversionRate = aggregateMetrics.conversions / aggregateMetrics.clicks * 100;
  const costPerConversion = aggregateMetrics.cost / aggregateMetrics.conversions;
  const callRate = aggregateMetrics.calls / aggregateMetrics.clicks * 100;

  const refreshData = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const exportData = () => {
    // Mock export functionality
    const csvData = metrics.map(metric => ({
      Campaign: campaigns.find(c => c.id === metric.campaignId)?.name || 'Unknown',
      Impressions: metric.impressions,
      Clicks: metric.clicks,
      CTR: `${metric.ctr}%`,
      CPC: `$${metric.cpc}`,
      Cost: `$${metric.cost}`,
      Conversions: metric.conversions,
      'Conversion Rate': `${metric.conversionRate}%`,
      'Cost/Conversion': `$${metric.costPerConversion}`,
      Calls: metric.calls,
      ROAS: metric.roas
    }));
    
    console.log('Exporting data:', csvData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Campaign Analytics</h2>
          <p className="text-muted-foreground">Performance insights and metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={onDateRangeChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={refreshData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Impressions</p>
                <p className="text-2xl font-semibold text-card-foreground">
                  {aggregateMetrics.impressions.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">+12.5%</span>
                </div>
              </div>
              <div className="h-10 w-10 bg-blue-100 flex items-center justify-center rounded-lg">
                <Eye className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Clicks</p>
                <p className="text-2xl font-semibold text-card-foreground">
                  {aggregateMetrics.clicks.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">+8.3%</span>
                </div>
              </div>
              <div className="h-10 w-10 bg-green-100 flex items-center justify-center rounded-lg">
                <MousePointer className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Cost</p>
                <p className="text-2xl font-semibold text-card-foreground">
                  ${aggregateMetrics.cost.toFixed(2)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="h-3 w-3 text-red-500" />
                  <span className="text-xs text-red-500">+15.2%</span>
                </div>
              </div>
              <div className="h-10 w-10 bg-amber-100 flex items-center justify-center rounded-lg">
                <DollarSign className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Conversions</p>
                <p className="text-2xl font-semibold text-card-foreground">
                  {aggregateMetrics.conversions}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">+22.7%</span>
                </div>
              </div>
              <div className="h-10 w-10 bg-purple-100 flex items-center justify-center rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-6 bg-muted border-border">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="campaigns">By Campaign</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Summary */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Average CTR</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{avgCtr.toFixed(2)}%</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Excellent
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Average CPC</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">${avgCpc.toFixed(2)}</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Good
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Conversion Rate</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{conversionRate.toFixed(2)}%</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Excellent
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Cost per Conversion</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">${costPerConversion.toFixed(2)}</span>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                      Average
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Performing Campaigns */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Top Performing Campaigns
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {metrics.slice(0, 3).map((metric) => {
                  const campaign = campaigns.find(c => c.id === metric.campaignId);
                  return (
                    <div key={metric.campaignId} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div>
                        <p className="font-medium text-sm">{campaign?.name || 'Campaign'}</p>
                        <p className="text-xs text-muted-foreground">
                          {metric.clicks} clicks • {metric.conversions} conversions
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">{metric.ctr.toFixed(2)}% CTR</p>
                        <p className="text-xs text-muted-foreground">
                          ROAS: {metric.roas.toFixed(1)}x
                        </p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <Phone className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <p className="text-2xl font-semibold">{aggregateMetrics.calls}</p>
                  <p className="text-sm text-muted-foreground">Total Calls</p>
                  <p className="text-xs text-green-500 mt-1">
                    {callRate.toFixed(2)}% call rate
                  </p>
                </div>
                
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <Users className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <p className="text-2xl font-semibold">{aggregateMetrics.conversions}</p>
                  <p className="text-sm text-muted-foreground">Conversions</p>
                  <p className="text-xs text-green-500 mt-1">
                    {conversionRate.toFixed(2)}% conversion rate
                  </p>
                </div>
                
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-amber-500" />
                  <p className="text-2xl font-semibold">${costPerConversion.toFixed(0)}</p>
                  <p className="text-sm text-muted-foreground">Cost per Conversion</p>
                  <p className="text-xs text-blue-500 mt-1">
                    Industry avg: $75
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Campaign Performance Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.map((metric) => {
                  const campaign = campaigns.find(c => c.id === metric.campaignId);
                  return (
                    <div key={metric.campaignId} className="p-4 rounded-lg border border-border bg-muted/20">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{campaign?.name || 'Campaign'}</h4>
                        <Badge variant={campaign?.status === 'active' ? 'default' : 'secondary'}>
                          {campaign?.status || 'active'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Impressions</p>
                          <p className="font-medium">{metric.impressions.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Clicks</p>
                          <p className="font-medium">{metric.clicks}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">CTR</p>
                          <p className="font-medium">{metric.ctr.toFixed(2)}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">CPC</p>
                          <p className="font-medium">${metric.cpc.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Cost</p>
                          <p className="font-medium">${metric.cost.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">ROAS</p>
                          <p className="font-medium">{metric.roas.toFixed(1)}x</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Performance Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Trend Analysis</h3>
                <p className="text-muted-foreground">
                  Advanced trend analysis and forecasting features coming soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
