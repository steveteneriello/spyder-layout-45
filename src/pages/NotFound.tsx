
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-6xl font-bold text-primary">404</CardTitle>
          <CardDescription className="text-xl">
            Page Not Found
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-6">
            The page you're looking for doesn't exist.
          </p>
          <Button asChild>
            <Link to="/">
              Go Home
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
