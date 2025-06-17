import React from 'react';
import { Link } from 'react-router-dom';
import { useGlobalTheme } from '@/contexts/GlobalThemeContext';
import { NotFoundThemeDebug } from '@/components/theme/ThemeDebugSection';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Home, 
  ArrowLeft, 
  Search, 
  AlertTriangle,
  Compass,
  RefreshCw,
  ExternalLink,
  HelpCircle,
  Settings
} from 'lucide-react';

const quickLinks = [
  {
    title: 'Dashboard',
    description: 'Return to the main dashboard',
    href: '/',
    icon: Home,
    variant: 'default' as const,
  },
  {
    title: 'Campaigns',
    description: 'View your marketing campaigns',
    href: '/campaigns',
    icon: Search,
    variant: 'outline' as const,
  },
  {
    title: 'Scheduler',
    description: 'Manage your scheduled jobs',
    href: '/scheduler',
    icon: RefreshCw,
    variant: 'outline' as const,
  },
  {
    title: 'Location Builder',
    description: 'Build location targeting lists',
    href: '/location-builder',
    icon: Compass,
    variant: 'outline' as const,
  },
];

const helpResources = [
  {
    title: 'Documentation',
    description: 'Browse our comprehensive guides',
    href: '/docs',
    icon: HelpCircle,
  },
  {
    title: 'Support Center',
    description: 'Get help from our support team',
    href: '/support',
    icon: ExternalLink,
  },
  {
    title: 'System Status',
    description: 'Check if there are any known issues',
    href: '/status',
    icon: AlertTriangle,
  },
];

export default function NotFound() {
  const { actualTheme, themeMode } = useGlobalTheme();

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        
        {/* Theme Status Badge */}
        <div className="flex justify-center mb-6">
          <Badge variant="outline" className="text-muted-foreground">
            Theme: {actualTheme} mode | Status: ✅ Working
          </Badge>
        </div>

        {/* Main Error Card */}
        <Card className="text-center mb-8 border-2 border-border">
          <CardHeader className="pb-4">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-6xl font-bold text-primary mb-2">
              404
            </CardTitle>
            <CardTitle className="text-2xl font-semibold text-foreground mb-2">
              Page Not Found
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              The page you're looking for doesn't exist or has been moved.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <Button onClick={handleGoBack} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Page
              </Button>
              <Button asChild>
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Link>
              </Button>
            </div>

            <Separator className="my-6" />

            {/* Theme Debug Section - Controlled by debug toggle */}
            <NotFoundThemeDebug />

            {/* Quick Navigation */}
            <div className="text-left">
              <h3 className="text-lg font-semibold text-foreground mb-4 text-center">
                Where would you like to go?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {quickLinks.map((link, index) => {
                  const Icon = link.icon;
                  return (
                    <Button
                      key={index}
                      variant={link.variant}
                      className="h-auto p-4 justify-start"
                      asChild
                    >
                      <Link to={link.href}>
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5" />
                          <div className="text-left">
                            <div className="font-semibold">{link.title}</div>
                            <div className="text-xs opacity-75">{link.description}</div>
                          </div>
                        </div>
                      </Link>
                    </Button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help Resources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground text-center justify-center">
              <HelpCircle className="h-5 w-5 text-primary" />
              Need Help?
            </CardTitle>
            <CardDescription className="text-center">
              If you think this is an error, here are some resources that might help
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {helpResources.map((resource, index) => {
                const Icon = resource.icon;
                return (
                  <div
                    key={index}
                    className="p-4 border border-border rounded-lg hover:bg-accent hover:border-primary/50 transition-all cursor-pointer"
                  >
                    <div className="text-center">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <h4 className="font-semibold text-foreground mb-1">
                        {resource.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {resource.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>
            If you continue to experience issues, please{' '}
            <a href="/contact" className="text-primary hover:underline">
              contact our support team
            </a>
          </p>
          <p className="mt-2">
            Error Code: 404 | Theme: {actualTheme} | 
            <button 
              onClick={() => window.location.href = '/admin/theme'}
              className="text-primary hover:underline ml-1"
            >
              Theme Settings
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
