import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { SideCategory } from '@/components/navigation/SideCategory';
import { useGlobalTheme } from '@/contexts/GlobalThemeContext';
import { useMenuConfig } from '@/hooks/useMenuConfig';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Bug, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Zap, 
  Database, 
  Activity, 
  FileText,
  Download,
  RefreshCw,
  Eye,
  Settings,
  TrendingUp,
  Clock,
  Users,
  Wifi
} from 'lucide-react';
import { BrandLogo } from '@/components/ui/brand-logo';

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  score: number;
  checks: {
    name: string;
    status: 'pass' | 'warn' | 'fail';
    message: string;
  }[];
}

interface PerformanceData {
  memoryUsage: number;
  renderTime: number;
  loadTime: number;
  errorRate: number;
}

interface BugReport {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  component: string;
  reported: Date;
  status: 'open' | 'investigating' | 'resolved';
  description: string;
}

export default function DebugDashboard() {
  const { actualTheme, themeMode, debugSettings } = useGlobalTheme();
  const { getMenuItems, getSections } = useMenuConfig();
  const allMenuItems = getMenuItems();
  const menuSections = getSections();

  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    status: 'healthy',
    score: 85,
    checks: []
  });
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    memoryUsage: 0,
    renderTime: 0,
    loadTime: 0,
    errorRate: 0
  });
  const [bugReports, setBugReports] = useState<BugReport[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    runSystemHealthCheck();
    loadPerformanceMetrics();
    loadBugReports();
    
    const interval = setInterval(() => {
      loadPerformanceMetrics();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const runSystemHealthCheck = async () => {
    setIsAnalyzing(true);
    
    const checks = [
      {
        name: 'Theme System',
        status: actualTheme && themeMode ? 'pass' : 'fail',
        message: actualTheme && themeMode ? 'Theme system operational' : 'Theme system error'
      },
      {
        name: 'Menu Configuration',
        status: allMenuItems.length > 0 ? 'pass' : 'fail',
        message: `${allMenuItems.length} menu items loaded`
      },
      {
        name: 'Debug Settings',
        status: debugSettings ? 'pass' : 'warn',
        message: debugSettings ? 'Debug settings available' : 'Debug settings not configured'
      },
      {
        name: 'Local Storage',
        status: typeof localStorage !== 'undefined' ? 'pass' : 'fail',
        message: typeof localStorage !== 'undefined' ? 'Local storage available' : 'Local storage not available'
      },
      {
        name: 'Network Connection',
        status: navigator.onLine ? 'pass' : 'fail',
        message: navigator.onLine ? 'Online' : 'Offline'
      },
      {
        name: 'Browser Compatibility',
        status: 'requestAnimationFrame' in window ? 'pass' : 'warn',
        message: 'requestAnimationFrame' in window ? 'Modern browser features available' : 'Limited browser support'
      }
    ];

    const passCount = checks.filter(c => c.status === 'pass').length;
    const score = Math.round((passCount / checks.length) * 100);
    const status = score >= 80 ? 'healthy' : score >= 60 ? 'warning' : 'critical';

    setSystemHealth({ status, score, checks });
    setIsAnalyzing(false);
  };

  const loadPerformanceMetrics = () => {
    const performance = window.performance;
    
    setPerformanceData({
      memoryUsage: (performance as any).memory ? 
        Math.round(((performance as any).memory.usedJSHeapSize / 1048576) * 100) / 100 : 0,
      renderTime: Math.round(performance.now() % 100),
      loadTime: performance.timing ? 
        performance.timing.loadEventEnd - performance.timing.navigationStart : 0,
      errorRate: Math.random() * 5 // Simulated error rate
    });
  };

  const loadBugReports = () => {
    // In a real app, this would load from an API or local storage
    const mockReports: BugReport[] = [
      {
        id: '1',
        title: 'Sidebar menu duplication on hover',
        severity: 'medium',
        component: 'SideCategory',
        reported: new Date(Date.now() - 86400000),
        status: 'resolved',
        description: 'Menu items duplicating when hovering over sidebar'
      },
      {
        id: '2',
        title: 'Theme flash on page load',
        severity: 'low',
        component: 'GlobalThemeContext',
        reported: new Date(Date.now() - 172800000),
        status: 'resolved',
        description: 'Brief flash of incorrect theme colors during page initialization'
      },
      {
        id: '3',
        title: 'Color variables not updating in admin editor',
        severity: 'high',
        component: 'ThemeSettings',
        reported: new Date(Date.now() - 3600000),
        status: 'investigating',
        description: 'New navigation color variables not appearing in theme editor'
      }
    ];
    
    setBugReports(mockReports);
  };

  const runAdvancedCodeAnalysis = async () => {
    setIsAnalyzing(true);
    
    try {
      // In a real implementation, this would call the advanced-code-checker
      const response = await fetch('/api/run-code-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: './src' })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Code analysis completed:', data);
        // Update UI with results
      }
    } catch (error) {
      console.error('Code analysis failed:', error);
    }
    
    setIsAnalyzing(false);
  };

  const exportDebugData = () => {
    const debugData = {
      timestamp: new Date().toISOString(),
      systemHealth,
      performanceData,
      bugReports,
      theme: { actualTheme, themeMode },
      debugSettings,
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    const blob = new Blob([JSON.stringify(debugData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-dashboard-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'pass':
      case 'resolved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
      case 'warn':
      case 'investigating':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical':
      case 'fail':
      case 'open':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      'critical': 'destructive',
      'high': 'destructive',
      'medium': 'default',
      'low': 'secondary'
    };
    return <Badge variant={variants[severity as keyof typeof variants] as any}>{severity}</Badge>;
  };

  return (
    <SidebarLayout
      nav={
        <div className="flex items-center justify-between w-full px-4">
          <div className="flex items-center gap-3">
            <BrandLogo
              size="md"
              showText={true}
              className="flex items-center gap-3 text-header-foreground"
            />
          </div>
          <Badge variant="outline" className="text-header-foreground border-header-foreground/20">
            Debug Mode
          </Badge>
        </div>
      }
      category={
        <div className="space-y-4">
          {menuSections.map((section) => (
            <SideCategory 
              key={section.name} 
              section={section.name} 
              items={section.items} 
            />
          ))}
        </div>
      }
      menuItems={allMenuItems}
    >
      <div className="p-6 bg-background text-foreground min-h-screen">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bug className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-foreground">Debug Dashboard</h1>
                <p className="text-muted-foreground">
                  System monitoring and debugging tools
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={runSystemHealthCheck}
                disabled={isAnalyzing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                onClick={exportDebugData}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                variant="outline"
                onClick={runAdvancedCodeAnalysis}
                disabled={isAnalyzing}
              >
                <Activity className="h-4 w-4 mr-2" />
                Analyze Code
              </Button>
            </div>
          </div>
        </div>

        {/* System Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                {getStatusIcon(systemHealth.status)}
                <div>
                  <div className="font-semibold">System Health</div>
                  <div className="text-2xl font-bold">{systemHealth.score}%</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="font-semibold">Memory Usage</div>
                  <div className="text-2xl font-bold">{performanceData.memoryUsage} MB</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-green-500" />
                <div>
                  <div className="font-semibold">Render Time</div>
                  <div className="text-2xl font-bold">{performanceData.renderTime} ms</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <div>
                  <div className="font-semibold">Error Rate</div>
                  <div className="text-2xl font-bold">{performanceData.errorRate.toFixed(1)}%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Information */}
        <Tabs defaultValue="health" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="health">System Health</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="bugs">Bug Reports</TabsTrigger>
            <TabsTrigger value="settings">Debug Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="health" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Health Checks
                </CardTitle>
                <CardDescription>
                  Automated checks of core system components
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium">Overall Score</span>
                    <span className="text-sm text-muted-foreground">{systemHealth.score}%</span>
                  </div>
                  <Progress value={systemHealth.score} className="mb-4" />
                  
                  {systemHealth.checks.map((check, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(check.status)}
                        <div>
                          <div className="font-medium">{check.name}</div>
                          <div className="text-sm text-muted-foreground">{check.message}</div>
                        </div>
                      </div>
                      <Badge variant={check.status === 'pass' ? 'secondary' : check.status === 'warn' ? 'default' : 'destructive'}>
                        {check.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Memory Usage</span>
                      <span>{performanceData.memoryUsage} MB</span>
                    </div>
                    <Progress value={Math.min(performanceData.memoryUsage / 2, 100)} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Render Performance</span>
                      <span>{performanceData.renderTime} ms</span>
                    </div>
                    <Progress value={Math.min(performanceData.renderTime, 100)} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Error Rate</span>
                      <span>{performanceData.errorRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={performanceData.errorRate * 20} className="[&>div]:bg-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Real-time Monitoring</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>Theme Mode:</span>
                      <span className="font-mono">{themeMode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Theme:</span>
                      <span className="font-mono">{actualTheme}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Menu Items:</span>
                      <span className="font-mono">{allMenuItems.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Page URL:</span>
                      <span className="font-mono text-xs">{window.location.pathname}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Connection:</span>
                      <div className="flex items-center gap-1">
                        <Wifi className="h-3 w-3" />
                        <span className="font-mono">{navigator.onLine ? 'Online' : 'Offline'}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bugs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bug className="h-5 w-5" />
                  Bug Reports & Issues
                </CardTitle>
                <CardDescription>
                  Track and monitor application issues
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {bugReports.map(bug => (
                    <div key={bug.id} className="p-4 border border-border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{bug.title}</h4>
                            {getSeverityBadge(bug.severity)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {bug.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Component: {bug.component}</span>
                            <span>Reported: {bug.reported.toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(bug.status)}
                          <Badge variant="outline">{bug.status}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {bugReports.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                      <p>No active bug reports</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Debug Configuration
                </CardTitle>
                <CardDescription>
                  Control debugging features and monitoring
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-medium mb-2">Current Debug Settings</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Show Theme Debug:</span>
                        <span className="ml-2 font-mono">
                          {debugSettings?.showThemeDebug ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Color Preview:</span>
                        <span className="ml-2 font-mono">
                          {debugSettings?.showColorPreview ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Environment:</span>
                        <span className="ml-2 font-mono">{process.env.NODE_ENV}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Debug Panel:</span>
                        <span className="ml-2 font-mono">
                          {debugSettings?.showDebugPanel ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" asChild>
                      <Link to="/admin/theme">
                        <Settings className="h-4 w-4 mr-2" />
                        Configure Debug Settings
                      </Link>
                    </Button>
                    <Button variant="outline" onClick={() => window.location.reload()}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reload Application
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SidebarLayout>
  );
}
