import React from 'react';
import { Settings, Home } from 'lucide-react';
import { useGlobalTheme } from '@/contexts/GlobalThemeContext';

interface BrandHeaderProps {
  className?: string;
  showTagline?: boolean;
}

export function BrandHeader({ className = "", showTagline = true }: BrandHeaderProps) {
  const { brandSettings, actualTheme } = useGlobalTheme();

  // Determine which logo to show
  const currentLogo = actualTheme === 'light' 
    ? brandSettings.lightModeLogo || brandSettings.darkModeLogo
    : brandSettings.darkModeLogo || brandSettings.lightModeLogo;

  // Size mapping
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-10 h-10'
  };

  const logoSize = sizeClasses[brandSettings.logoSize] || sizeClasses.md;

  // Position classes
  const positionClasses = brandSettings.logoPosition === 'center' ? 'justify-center' : '';

  return (
    <div className={`flex items-center gap-3 ${positionClasses} ${className}`}>
      {/* Logo or Default Icon */}
      {brandSettings.useLogo && currentLogo ? (
        <div className={logoSize}>
          <img 
            src={currentLogo}
            alt={`${brandSettings.brandText} logo`}
            className="w-full h-full object-contain"
          />
        </div>
      ) : (
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
          <Home className="h-5 w-5 text-black" />
        </div>
      )}

      {/* Brand Text */}
      <div className="text-white">
        <div className="font-bold text-sm">{brandSettings.brandText}</div>
        {showTagline && brandSettings.showTagline && (
          <div className="text-xs opacity-75">{brandSettings.tagline}</div>
        )}
      </div>
    </div>
  );
}

// Default export for convenience
export default BrandHeader;