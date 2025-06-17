import React from 'react';
import { Palette } from 'lucide-react';
import { useGlobalTheme } from '@/contexts/GlobalThemeContext';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  textColor?: string;
}

export function BrandLogo({ 
  className = '', 
  size = 'md', 
  showText = true, 
  textColor = 'inherit' 
}: BrandLogoProps) {
  const { actualTheme, brandSettings } = useGlobalTheme();

  const getSizeClass = (size: string) => {
    switch (size) {
      case 'sm': return 'h-6 w-6';
      case 'lg': return 'h-10 w-10';
      default: return 'h-8 w-8';
    }
  };

  const getCurrentLogo = () => {
    return actualTheme === 'dark' ? brandSettings.darkModeLogo : brandSettings.lightModeLogo;
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo or Icon */}
      {brandSettings.useLogo && getCurrentLogo() ? (
        <img 
          src={getCurrentLogo()!} 
          alt="Logo"
          className={`object-contain ${getSizeClass(size)}`}
        />
      ) : (
        <div className={`${getSizeClass(size)} bg-primary rounded-lg flex items-center justify-center`}>
          <Palette className={`${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-6 w-6' : 'h-4 w-4'} text-primary-foreground`} />
        </div>
      )}
      
      {/* Brand Text */}
      {showText && (
        <div style={{ color: textColor }}>
          <div className="font-bold text-sm">{brandSettings.brandText}</div>
          {brandSettings.showTagline && (
            <div className="text-xs opacity-75">{brandSettings.tagline}</div>
          )}
        </div>
      )}
    </div>
  );
}

export default BrandLogo;
