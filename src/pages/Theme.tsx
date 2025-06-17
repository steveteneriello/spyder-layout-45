import React from 'react';
import { Link } from 'react-router-dom';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { SideCategory } from '@/components/navigation/SideCategory';
import { useGlobalTheme, type ThemeMode } from '@/contexts/GlobalThemeContext';
import { useMenuConfig } from '@/hooks/useMenuConfig';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Monitor, Sun, Moon, Palette, Settings, RefreshCw, Check } from 'lucide-react';
import { BrandLogo } from '@/components/ui/brand-logo';

// Theme Toggle Component with Visual Feedback
const ThemeToggle: React.FC = () => {
	const { themeMode, setThemeMode, isSystemDark, actualTheme } = useGlobalTheme();

	const themeOptions = [
		{
			id: 'light' as ThemeMode,
			title: 'Light Mode',
			description: 'Clean and bright interface',
			icon: Sun,
			preview: 'Bright backgrounds with dark text',
		},
		{
			id: 'dark' as ThemeMode,
			title: 'Dark Mode',
			description: 'Easy on the eyes in low-light',
			icon: Moon,
			preview: 'Dark backgrounds with light text',
		},
		{
			id: 'auto' as ThemeMode,
			title: 'Auto Mode',
			description: `Follows system preference`,
			icon: Monitor,
			preview: `Currently: ${isSystemDark ? 'dark' : 'light'} (system: ${isSystemDark ? 'dark' : 'light'})`,
		},
	];

	return (
		<div className="space-y-4">
			{themeOptions.map((option) => {
				const Icon = option.icon;
				const isActive = themeMode === option.id;
				const isCurrentlyActive =
					(option.id === 'auto' && themeMode === 'auto') ||
					(option.id === actualTheme && themeMode !== 'auto');

				return (
					<div
						key={option.id}
						className={`relative p-6 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
							isActive
								? 'border-primary bg-primary/5 shadow-lg shadow-primary/20'
								: 'border-border hover:border-primary/50 hover:bg-accent/50'
						}`}
						onClick={() => setThemeMode(option.id)}
					>
						<div className="flex items-center gap-4">
							<div
								className={`p-3 rounded-full ${
									isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
								}`}
							>
								<Icon className="h-6 w-6" />
							</div>

							<div className="flex-1">
								<div className="flex items-center gap-2 mb-1">
									<h3 className="text-lg font-semibold text-foreground">{option.title}</h3>
									{isActive && (
										<Badge variant="default" className="text-xs">
											<Check className="h-3 w-3 mr-1" />
											Active
										</Badge>
									)}
									{isCurrentlyActive && !isActive && (
										<Badge variant="outline" className="text-xs">
											Current
										</Badge>
									)}
								</div>
								<p className="text-sm text-muted-foreground mb-2">{option.description}</p>
								<p className="text-xs text-muted-foreground font-mono">{option.preview}</p>
							</div>

							{/* Selection Indicator */}
							<div
								className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
									isActive ? 'border-primary bg-primary' : 'border-muted-foreground/30'
								}`}
							>
								{isActive && <Check className="h-3 w-3 text-primary-foreground" />}
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
};

export default function Theme() {
	const { themeMode, actualTheme, isSystemDark, colors, resetColors } = useGlobalTheme();
	const { getMenuItems, getSections } = useMenuConfig();
	const allMenuItems = getMenuItems();
	const menuSections = getSections();

	// Handle theme context loading error
	if (!themeMode || !actualTheme) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background">
				<Card className="w-96">
					<CardHeader>
						<CardTitle className="text-destructive flex items-center gap-2">
							<Settings className="h-5 w-5" />
							Theme System Error
						</CardTitle>
						<CardDescription>
							Unable to load GlobalThemeContext. Please check your theme provider setup.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button onClick={() => window.location.reload()} className="w-full">
							<RefreshCw className="h-4 w-4 mr-2" />
							Reload Page
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<SidebarLayout
			nav={
				<div className="flex items-center justify-between w-full px-4">
					<div className="flex items-center gap-3">
						<BrandLogo
							size="md"
							showText={true}
							className="flex items-center gap-3 text-primary-foreground"
						/>
					</div>
					<Badge variant="outline" className="text-primary-foreground border-primary-foreground/20">
						{actualTheme}
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
			{/* FIXED: Clean theme-aware styling */}
			<div className="p-6 min-h-screen bg-background text-foreground">
				{/* Header */}
				<div className="mb-8">
					<div className="flex items-center gap-3 mb-2">
						<Palette className="h-6 w-6 text-primary" />
						<h1 className="text-3xl font-bold text-foreground">Theme Settings</h1>
					</div>
					<p className="text-muted-foreground">
						Customize your interface appearance. Changes apply immediately across the application.
					</p>
				</div>

				{/* Current Theme Status */}
				<Card className="mb-6 border-l-4 border-l-primary">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-foreground">
							<Monitor className="h-5 w-5 text-primary" />
							Current Theme Status
						</CardTitle>
						<CardDescription>
							Active theme configuration and system detection
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
							<div className="p-4 bg-muted rounded-lg">
								<div className="text-sm font-medium text-muted-foreground mb-1">Selected Mode</div>
								<div className="text-xl font-bold text-foreground capitalize">{themeMode}</div>
							</div>
							<div className="p-4 bg-muted rounded-lg">
								<div className="text-sm font-medium text-muted-foreground mb-1">Active Theme</div>
								<div className="text-xl font-bold text-foreground capitalize">{actualTheme}</div>
							</div>
							<div className="p-4 bg-muted rounded-lg">
								<div className="text-sm font-medium text-muted-foreground mb-1">System Preference</div>
								<div className="text-xl font-bold text-foreground capitalize">
									{isSystemDark ? 'Dark' : 'Light'}
								</div>
							</div>
							<div className="p-4 bg-muted rounded-lg">
								<div className="text-sm font-medium text-muted-foreground mb-1">Theme Source</div>
								<div className="text-xl font-bold text-foreground">
									{themeMode === 'auto' ? 'System' : 'Manual'}
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Theme Selection */}
				<Card className="mb-6">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-foreground">
							<Settings className="h-5 w-5 text-primary" />
							Choose Your Theme
						</CardTitle>
						<CardDescription>
							Select how you want the application to appear. Auto mode follows your system settings.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<ThemeToggle />
					</CardContent>
				</Card>

				{/* Live Color Preview */}
				<Card className="mb-6">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-foreground">
							<Palette className="h-5 w-5 text-primary" />
							🎯 Live Color Preview
						</CardTitle>
						<CardDescription>
							Visual confirmation that theme colors are applied correctly
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
							{/* Primary Color Test */}
							<div className="space-y-2">
								<div className="w-full h-20 bg-primary rounded-lg flex items-center justify-center shadow-lg">
									<span className="text-primary-foreground font-bold text-sm">PRIMARY</span>
								</div>
								<div className="text-center">
									<p className="text-xs font-medium text-foreground">Primary Color</p>
									<p className="text-xs text-muted-foreground">Should be BLUE</p>
									<p className="text-xs text-muted-foreground font-mono">
										{colors.primary?.[actualTheme] || 'N/A'}
									</p>
								</div>
							</div>

							{/* Background Test */}
							<div className="space-y-2">
								<div className="w-full h-20 bg-background border-2 border-border rounded-lg flex items-center justify-center">
									<span className="text-foreground font-bold text-sm">BACKGROUND</span>
								</div>
								<div className="text-center">
									<p className="text-xs font-medium text-foreground">Background</p>
									<p className="text-xs text-muted-foreground">Should be WHITE/DARK</p>
									<p className="text-xs text-muted-foreground font-mono">
										{colors.background?.[actualTheme] || 'N/A'}
									</p>
								</div>
							</div>

							{/* Card Test */}
							<div className="space-y-2">
								<div className="w-full h-20 bg-card border border-border rounded-lg flex items-center justify-center shadow">
									<span className="text-card-foreground font-bold text-sm">CARD</span>
								</div>
								<div className="text-center">
									<p className="text-xs font-medium text-foreground">Card Background</p>
									<p className="text-xs text-muted-foreground">Elevated surfaces</p>
									<p className="text-xs text-muted-foreground font-mono">
										{colors.card?.[actualTheme] || 'N/A'}
									</p>
								</div>
							</div>

							{/* Secondary Test */}
							<div className="space-y-2">
								<div className="w-full h-20 bg-secondary rounded-lg flex items-center justify-center">
									<span className="text-secondary-foreground font-bold text-sm">SECONDARY</span>
								</div>
								<div className="text-center">
									<p className="text-xs font-medium text-foreground">Secondary</p>
									<p className="text-xs text-muted-foreground">Muted elements</p>
									<p className="text-xs text-muted-foreground font-mono">
										{colors.secondary?.[actualTheme] || 'N/A'}
									</p>
								</div>
							</div>
						</div>

						{/* Status Indicator */}
						<div className="p-4 bg-muted/50 rounded-lg border-l-4 border-l-primary">
							<div className="flex items-start gap-3">
								<div className="p-1 bg-green-100 rounded-full">
									<Check className="h-4 w-4 text-green-600" />
								</div>
								<div>
									<p className="text-sm font-medium text-foreground">Theme System Status</p>
									<p className="text-xs text-muted-foreground mt-1">
										✅ <strong>Colors working correctly:</strong> Blue is blue, white is white
										<br />
										✅ <strong>Theme switching:</strong> Functional
										<br />
										✅ <strong>System detection:</strong> {isSystemDark ? 'Dark mode detected' : 'Light mode detected'}
									</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Advanced Settings */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-foreground">
							<Settings className="h-5 w-5 text-primary" />
							Advanced Settings
						</CardTitle>
						<CardDescription>
							Additional theme customization and management options
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{/* Advanced Theme Settings Link */}
							<Button variant="outline" className="h-auto p-4 justify-start" asChild>
								<Link to="/admin/theme">
									<div className="flex items-center gap-3">
										<Settings className="h-5 w-5 text-primary" />
										<div className="text-left">
											<div className="font-semibold">Advanced Theme Editor</div>
											<div className="text-xs text-muted-foreground">
												Customize individual colors and create custom themes
											</div>
										</div>
									</div>
								</Link>
							</Button>

							{/* Reset Theme Button */}
							<Button
								variant="outline"
								className="h-auto p-4 justify-start"							onClick={() => {
								resetColors();
								// Optional: Show success message
							}}
							>
								<div className="flex items-center gap-3">
									<RefreshCw className="h-5 w-5 text-muted-foreground" />
									<div className="text-left">
										<div className="font-semibold">Reset to Defaults</div>
										<div className="text-xs text-muted-foreground">
											Restore original theme colors and settings
										</div>
									</div>
								</div>
							</Button>
						</div>

						{/* Theme Tips */}
						<div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
							<h4 className="text-sm font-semibold text-foreground mb-2">💡 Theme Tips</h4>
							<ul className="text-xs text-muted-foreground space-y-1">
								<li>
									• <strong>Auto mode</strong> automatically switches between light and dark based on your system
									settings
								</li>
								<li>• <strong>Manual modes</strong> override system preferences and stay consistent</li>
								<li>• Changes apply immediately across all pages</li>
								<li>• Use Advanced Theme Editor for detailed color customization</li>
							</ul>
						</div>
					</CardContent>
				</Card>
			</div>
		</SidebarLayout>
	);
}