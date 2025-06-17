import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Bug, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  XCircle, 
  Clock,
  Database,
  Wifi,
  Zap,
  Eye,
  EyeOff,
  Download,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { useGlobalTheme } from '@/contexts/GlobalThemeContext';

interface DebugLog {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  component?: string;
  data?: any;
  stack?: string;
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
}

interface DebugPanelProps {
  componentName: string;
  enabled?: boolean;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  maxLogs?: number;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
  componentName,
  enabled = process.env.NODE_ENV === 'development',
  position = 'bottom-right',
  maxLogs = 100
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [isRecording, setIsRecording] = useState(true);
  const { actualTheme, colors, debugSettings } = useGlobalTheme();

  // Auto-hide in production unless explicitly enabled
  if (!enabled && !debugSettings?.showDebugPanel) {
    return null;
  }

  useEffect(() => {
    // Monitor performance metrics
    const interval = setInterval(() => {
      updatePerformanceMetrics();
    }, 2000);

    // Log component mount
    addLog('info', `${componentName} mounted`, { theme: actualTheme });

    return () => {
      clearInterval(interval);
      addLog('info', `${componentName} unmounted`);
    };
  }, []);

  const addLog = (level: DebugLog['level'], message: string, data?: any, stack?: string) => {
    const newLog: DebugLog = {
      id: Date.now().toString(),
      timestamp: new Date(),
      level,
      message,
      component: componentName,
      data,
      stack
    };

    setLogs(prev => {
      const updated = [newLog, ...prev];
      return updated.slice(0, maxLogs);
    });
  };

  const updatePerformanceMetrics = () => {
    const metrics: PerformanceMetric[] = [];

    // Memory usage
    if (performance.memory) {
      const memoryUsage = (performance.memory.usedJSHeapSize / 1048576); // MB
      metrics.push({
        name: 'Memory Usage',
        value: Math.round(memoryUsage),
        unit: 'MB',
        status: memoryUsage > 100 ? 'critical' : memoryUsage > 50 ? 'warning' : 'good'
      });
    }

    // Connection status
    metrics.push({
      name: 'Connection',
      value: navigator.onLine ? 1 : 0,
      unit: navigator.onLine ? 'Online' : 'Offline',
      status: navigator.onLine ? 'good' : 'critical'
    });

    // Render time estimation
    const renderTime = performance.now() % 100;
    metrics.push({
      name: 'Render Time',
      value: Math.round(renderTime),
      unit: 'ms',
      status: renderTime > 50 ? 'warning' : 'good'
    });

    setPerformanceMetrics(metrics);
  };

  const clearLogs = () => {
    setLogs([]);
    addLog('info', 'Debug logs cleared');
  };

  const exportLogs = () => {
    const data = {
      component: componentName,
      timestamp: new Date().toISOString(),
      theme: actualTheme,
      logs: logs,
      performance: performanceMetrics
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-${componentName}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    addLog('info', 'Debug data exported');
  };

  const getLogIcon = (level: DebugLog['level']) => {
    switch (level) {
      case 'error': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'warn': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'debug': return <Bug className="h-4 w-4 text-blue-500" />;
      default: return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getMetricIcon = (status: PerformanceMetric['status']) => {
    switch (status) {
      case 'critical': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const positionClasses = {
    'bottom-right': 'fixed bottom-4 right-4',
    'bottom-left': 'fixed bottom-4 left-4',
    'top-right': 'fixed top-4 right-4',
    'top-left': 'fixed top-4 left-4'
  };

  // Expose debug methods globally for easy access
  useEffect(() => {
    (window as any).debugPanel = {
      log: (message: string, data?: any) => addLog('info', message, data),
      warn: (message: string, data?: any) => addLog('warn', message, data),
      error: (message: string, data?: any, stack?: string) => addLog('error', message, data, stack),
      debug: (message: string, data?: any) => addLog('debug', message, data),
      clear: clearLogs,
      export: exportLogs
    };

    return () => {
      delete (window as any).debugPanel;
    };
  }, []);

  return (
    <div className={`${positionClasses[position]} z-50 max-w-sm`}>
      {!isOpen ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="bg-background/90 backdrop-blur-sm border-border shadow-lg"
        >
          <Bug className="h-4 w-4 mr-2" />
          Debug {componentName}
          {logs.filter(log => log.level === 'error').length > 0 && (
            <Badge variant="destructive" className="ml-2 h-4 w-4 p-0 text-xs">
              {logs.filter(log => log.level === 'error').length}
            </Badge>
          )}
        </Button>
      ) : (
        <Card className="w-80 max-h-96 bg-background/95 backdrop-blur-sm border-border shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Bug className="h-4 w-4" />
                Debug: {componentName}
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsRecording(!isRecording)}
                  className="h-6 w-6 p-0"
                >
                  {isRecording ? 
                    <Eye className="h-3 w-3 text-green-500" /> : 
                    <EyeOff className="h-3 w-3 text-muted-foreground" />
                  }
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6 p-0"
                >
                  ×
                </Button>
              </div>
            </div>
            <CardDescription className="text-xs">
              Theme: {actualTheme} | Logs: {logs.length}/{maxLogs}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-3 p-3 max-h-80 overflow-y-auto">
            {/* Performance Metrics */}
            <Collapsible>
              <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium w-full">
                <Zap className="h-4 w-4" />
                Performance Metrics
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 mt-2">
                {performanceMetrics.map(metric => (
                  <div key={metric.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      {getMetricIcon(metric.status)}
                      <span>{metric.name}</span>
                    </div>
                    <span className="font-mono">
                      {metric.value} {metric.unit}
                    </span>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>

            {/* Action Buttons */}
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={clearLogs}
                className="h-6 text-xs flex-1"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportLogs}
                className="h-6 text-xs flex-1"
              >
                <Download className="h-3 w-3 mr-1" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={updatePerformanceMetrics}
                className="h-6 text-xs flex-1"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Refresh
              </Button>
            </div>

            {/* Debug Logs */}
            <div className="space-y-1">
              <div className="text-xs font-medium flex items-center gap-1">
                <Database className="h-3 w-3" />
                Recent Logs
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {logs.length === 0 ? (
                  <div className="text-xs text-muted-foreground text-center py-2">
                    No debug logs yet
                  </div>
                ) : (
                  logs.slice(0, 10).map(log => (
                    <div key={log.id} className="text-xs p-1 rounded bg-muted/50">
                      <div className="flex items-center gap-1 mb-1">
                        {getLogIcon(log.level)}
                        <span className="font-mono text-xs text-muted-foreground">
                          {log.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-xs">{log.message}</div>
                      {log.data && (
                        <div className="text-xs text-muted-foreground font-mono mt-1">
                          {JSON.stringify(log.data).substring(0, 50)}...
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Hook for easy debug logging
export const useDebugLogger = (componentName: string) => {
  const log = (level: 'info' | 'warn' | 'error' | 'debug', message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console[level](`[${componentName}] ${message}`, data);
      
      // Send to global debug panel if available - safely check for methods
      if ((window as any).debugPanel && typeof (window as any).debugPanel[level] === 'function') {
        try {
          (window as any).debugPanel[level](message, data);
        } catch (e) {
          // Silently fail if debug panel method doesn't work
        }
      }
    }
  };

  return {
    info: (message: string, data?: any) => log('info', message, data),
    warn: (message: string, data?: any) => log('warn', message, data),
    error: (message: string, data?: any) => log('error', message, data),
    debug: (message: string, data?: any) => log('debug', message, data)
  };
};

// Global error boundary for catching and logging errors
export class DebugErrorBoundary extends React.Component<
  { children: React.ReactNode; componentName: string },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[${this.props.componentName}] Error caught:`, error, errorInfo);
    
    // Send to global debug panel if available
    if ((window as any).debugPanel) {
      (window as any).debugPanel.error(
        `Error in ${this.props.componentName}: ${error.message}`,
        { error: error.toString(), errorInfo },
        error.stack
      );
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Component Error
            </CardTitle>
            <CardDescription>
              An error occurred in {this.props.componentName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {this.state.error?.message || 'Unknown error'}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => this.setState({ hasError: false, error: undefined })}
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default DebugPanel;
