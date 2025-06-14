
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from 'lucide-react';

export function OperationsMonitoring() {
  return (
    <div className="space-y-6">
      <Card className="campaign-card-bg campaign-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold campaign-primary-text flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Operations Monitoring
          </CardTitle>
          <CardDescription className="campaign-secondary-text">
            Monitor and track operations for your Oxylabs schedules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Operations monitoring is coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
