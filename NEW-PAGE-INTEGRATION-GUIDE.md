# New Page Integration Guide

## 🎯 Overview
This guide provides step-by-step instructions for integrating new pages into the centralized menu system and ensuring compliance with our design system standards.

## 📋 Pre-Integration Checklist

### 1. Required Imports
Every new page MUST include these imports:

```tsx
import React from 'react'; // or import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // For navigation
import SidebarLayout from '@/components/layout/SidebarLayout';
import { SideCategory } from '@/components/navigation/SideCategory';
import { useGlobalTheme } from '@/contexts/GlobalThemeContext';
import { useMenuConfig } from '@/hooks/useMenuConfig';
```

### 2. Basic Page Structure Template
```tsx
export default function YourNewPage() {
  const { actualTheme, themeMode } = useGlobalTheme();
  const { getMenuItems, getSections } = useMenuConfig();
  const allMenuItems = getMenuItems();
  const menuSections = getSections();

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
      <div className="p-6 bg-background text-foreground min-h-screen">
        {/* Your page content here */}
      </div>
    </SidebarLayout>
  );
}
```

## 🎨 Theme-Aware Colors & Classes

### ❌ NEVER Use Hardcoded Colors
```tsx
// ❌ WRONG - Hardcoded colors
className="text-blue-600 bg-green-100 border-red-500"
className="text-white bg-gray-800"
textColor="rgb(255, 255, 255)"
style={{ color: '#3b82f6' }}

// ❌ WRONG - Numbered color variants
className="text-gray-500 bg-blue-100 border-green-200"
```

### ✅ ALWAYS Use Theme-Aware Classes
```tsx
// ✅ CORRECT - Theme-aware classes
className="text-primary bg-background border-border"
className="text-foreground bg-card border-muted"
className="text-muted-foreground bg-secondary/10"

// ✅ Color system mapping:
// Primary colors: text-primary, bg-primary, border-primary
// Background: bg-background, bg-card, bg-muted
// Text: text-foreground, text-muted-foreground, text-primary-foreground
// Borders: border-border, border-muted, border-primary
// Secondary: text-secondary, bg-secondary, border-secondary
// Accent: text-accent, bg-accent, border-accent

// ✅ Using opacity variants
className="bg-primary/10 text-primary/80 border-primary/20"
```

### 🎨 Theme-Aware Component Examples
```tsx
// Status indicators
<Badge className="bg-primary text-primary-foreground">Active</Badge>
<Badge className="bg-secondary text-secondary-foreground">Paused</Badge>
<Badge className="bg-muted text-muted-foreground">Draft</Badge>

// Cards and containers
<Card className="bg-card border-border">
  <CardHeader className="border-b border-border">
    <CardTitle className="text-card-foreground">Title</CardTitle>
  </CardHeader>
  <CardContent className="text-muted-foreground">
    Content
  </CardContent>
</Card>

// Buttons
<Button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Primary Action
</Button>
<Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
  Secondary Action
</Button>
```

## 🎨 Extended Theme System

### Navigation Color Variables
The theme system now includes dedicated navigation color variables that can be customized via the admin theme editor:

```css
/* Available CSS variables for navigation */
--sidebar-background    /* Main sidebar background */
--sidebar-foreground    /* Sidebar text color */
--sidebar-hover         /* Sidebar item hover/active states */
--header-background     /* Header bar background */
--header-foreground     /* Header text color */
```

```tsx
// Using navigation colors in components
<div className="bg-sidebar-background text-sidebar-foreground">
  Sidebar content
</div>

<div className="bg-header-background text-header-foreground">
  Header content  
</div>

// Or with CSS variables directly
<div style={{ 
  backgroundColor: 'hsl(var(--sidebar-background))',
  color: 'hsl(var(--sidebar-foreground))'
}}>
  Custom styled component
</div>
```

### BrandLogo Component Usage
```tsx
import { BrandLogo } from '@/components/ui/brand-logo';

// ✅ Basic usage with theme-aware colors
<BrandLogo 
  size="md" 
  showText={true} 
  className="text-header-foreground" 
/>

// ✅ Different sizes and contexts
<BrandLogo size="sm" showText={false} className="text-primary" />
<BrandLogo size="lg" showText={true} className="text-foreground" />

// ❌ WRONG - Don't use textColor prop with hardcoded values
<BrandLogo textColor="rgb(255, 255, 255)" />
<BrandLogo textColor="#ffffff" />
```

## 🔗 Navigation Best Practices

### ❌ NEVER Use Anchor Tags for Internal Navigation
```tsx
// ❌ WRONG - Breaks SPA navigation and active states
<a href="/dashboard">Go to Dashboard</a>
<Button asChild>
  <a href="/campaigns">View Campaigns</a>
</Button>
```

### ✅ ALWAYS Use React Router Link
```tsx
// ✅ CORRECT - Proper SPA navigation
<Link to="/dashboard">Go to Dashboard</Link>
<Button asChild>
  <Link to="/campaigns">View Campaigns</Link>
</Button>

// ✅ With icons and complex content
<Button variant="outline" asChild>
  <Link to="/scheduler">
    <Calendar className="h-4 w-4 mr-2" />
    Back to Dashboard
  </Link>
</Button>
```

## 🛠️ Common Integration Issues & Solutions

### Issue 1: ES Modules Compatibility
**Problem**: Compliance checker fails with `require()` errors
```bash
# ❌ Error: require() of ES modules not supported
node compliance-checker.js
```

**Solution**: Ensure package.json has ES module configuration
```json
{
  "type": "module",
  "scripts": {
    "check-compliance": "node compliance-checker.js"
  }
}
```

### Issue 2: React Import Pattern Not Detected
**Problem**: Compliance checker reports "Missing React import" even when React is imported
```tsx
// These patterns should ALL be detected:
import React from 'react';
import React, { useState } from 'react';
import React, { useState, useEffect } from 'react';
```

**Solution**: Compliance checker now uses regex pattern:
```javascript
{ import: "import React.*from ['\"]react['\"]", name: "React", isRegex: true }
```

### Issue 3: Incorrect Menu Section Integration
**Problem**: Using old menu pattern breaks dynamic updates
```tsx
// ❌ WRONG - Old hardcoded pattern
{menuSections.map((section) => (
  <SideCategory 
    key={section} 
    section={section} 
    items={allMenuItems.filter((item) => item.section === section)} 
  />
))}
```

**Solution**: Use new dynamic section pattern
```tsx
// ✅ CORRECT - Dynamic section integration
{menuSections.map((section) => (
  <SideCategory 
    key={section.name}
    section={section.name} 
    items={section.items} 
  />
))}
```

### Issue 4: BrandLogo Hardcoded Colors
**Problem**: Using textColor prop with hardcoded values
```tsx
// ❌ WRONG
<BrandLogo textColor="rgb(255, 255, 255)" />
<BrandLogo textColor="#ffffff" />
```

**Solution**: Use className for theme-aware colors
```tsx
// ✅ CORRECT
<BrandLogo className="text-primary-foreground" />
<BrandLogo className="text-white" /> // Only if specifically needed
```

### Issue 5: Console.log Statements in Production
**Problem**: Development debugging code left in production
```tsx
// ❌ WRONG - Remove before production
console.log('Debug info:', data);
console.error('This should not be in production');
```

**Solution**: Remove or replace with proper logging
```tsx
// ✅ CORRECT - Clean production code
// Handle the logic without console output
handleData(data);

// Or use proper logging in development only
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data);
}
```

## 📊 Using the Compliance Checker

### Run Compliance Check
```bash
# Check a specific page
node compliance-checker.js src/pages/YourNewPage.tsx

# Expected output for compliant page:
# Score: 100%
# Summary: 17 passed, 0 warnings, 0 errors
```

### Compliance Criteria (17 checks)
1. ✅ React import present
2. ✅ SidebarLayout import present  
3. ✅ useGlobalTheme import present
4. ✅ useMenuConfig import present
5. ✅ Theme hook properly used
6. ✅ Theme-aware classes used
7. ✅ Menu hook properly used
8. ✅ Proper menu section integration
9. ✅ SideCategory component used
10. ✅ SidebarLayout component used
11. ✅ SidebarLayout nav prop present
12. ✅ SidebarLayout category prop present
13. ✅ SidebarLayout menuItems prop present
14. ✅ Proper main content wrapper
15. ✅ Page includes heading elements
16. ✅ Responsive design classes found
17. ✅ Modern layout patterns used

### Warning Categories
- ⚠️ Hardcoded colors detected
- ⚠️ Console.log statements found
- ⚠️ Anchor tags instead of Link components
- ⚠️ Missing responsive design classes
- ⚠️ Missing accessibility features

## 🚀 Step-by-Step Integration Process

### Step 1: Create Page with Template
1. Copy the basic page structure template above
2. Replace `YourNewPage` with your actual page name
3. Add your specific imports and content

### Step 2: Implement Theme-Aware Styling
1. Replace any hardcoded colors with theme-aware classes
2. Use the color system mapping provided above
3. Test in both light and dark themes

### Step 3: Add Navigation Elements
1. Replace all `<a href="">` with `<Link to="">`
2. Ensure proper React Router integration
3. Test navigation and active states

### Step 4: Run Compliance Check
```bash
node compliance-checker.js src/pages/YourNewPage.tsx
```

### Step 5: Fix Any Issues
1. Address errors first (these break functionality)
2. Address warnings (these are best practices)
3. Aim for 95%+ compliance score

### Step 6: Test Integration
1. ✅ Page loads without errors
2. ✅ Theme switching works properly  
3. ✅ Navigation functions correctly
4. ✅ Menu shows current page as active
5. ✅ Responsive design works on all screen sizes

## 📚 Additional Resources

### Theme System Documentation
- Global theme context: `/src/contexts/GlobalThemeContext.tsx`
- Theme utilities: `/src/lib/utils.ts`
- CSS variables: `/src/styles/globals.css`

### Menu System Documentation
- Menu configuration hook: `/src/hooks/useMenuConfig.ts`
- Menu management page: `/src/pages/admin/MenuManagement.tsx`
- Sidebar layout: `/src/components/layout/SidebarLayout.tsx`

### Component Library
- UI components: `/src/components/ui/`
- Navigation components: `/src/components/navigation/`
- Layout components: `/src/components/layout/`

## 🔧 Troubleshooting

### Page Not Appearing in Menu
1. Check if page route is added to routing configuration
2. Verify menu item is configured in Menu Management
3. Ensure proper section assignment

### Theme Not Applied
1. Verify `useGlobalTheme` hook is called
2. Check for hardcoded colors overriding theme
3. Ensure proper CSS class usage

### Compliance Checker Errors
1. Check file path is correct
2. Verify ES modules configuration
3. Ensure all required imports are present

---

## 📝 Complete Integration Checklist

Before submitting a new page for review:

### 🏗️ Core Architecture
- [ ] All required imports present (React, SidebarLayout, useGlobalTheme, useMenuConfig)
- [ ] useGlobalTheme and useMenuConfig hooks used correctly
- [ ] SidebarLayout with correct props (nav, category, menuItems)
- [ ] Menu sections use `section.name` and `section.items` pattern
- [ ] Proper theme-aware main content wrapper (`min-h-screen bg-background`)

### 🎨 Design System Compliance
- [ ] No hardcoded colors anywhere (no bg-white, text-black, #colors, rgb())
- [ ] All theme-aware classes used (`bg-background`, `text-foreground`, etc.)
- [ ] All internal links use `<Link to="">` (no anchor tags)
- [ ] No console.log statements in production code
- [ ] Responsive classes included (sm:, md:, lg:, xl:)

### 🐛 Debugging & Quality
- [ ] DebugPanel component integrated
- [ ] DebugErrorBoundary wrapper implemented  
- [ ] useDebugLogger hook used for logging
- [ ] All buttons have onClick handlers or navigation
- [ ] All inputs are controlled (have value/onChange)
- [ ] Error handling implemented for async operations
- [ ] Loading states implemented where appropriate

### 🧪 Testing & Validation
- [ ] Compliance checker shows 95%+ score
- [ ] Advanced code checker shows no critical issues
- [ ] Page tested in light and dark themes
- [ ] Navigation tested and working
- [ ] Responsive design tested on multiple screen sizes
- [ ] Debug panel functions correctly
- [ ] Error boundaries catch and display errors properly

### 🔧 Available Tools

#### Compliance Checking
```bash
# Check single page compliance
npm run check-compliance src/pages/YourPage.tsx

# Expected output for perfect page:
# Score: 100%
# Summary: 18+ passed, 0 warnings, 0 errors
```

#### Advanced Code Analysis
```bash
# Analyze entire codebase
npm run analyze-code

# Analyze single file
node advanced-code-checker.js src/pages/YourPage.tsx

# Generates debug-dashboard.html with detailed results
```

#### Debug Dashboard
- Access: `/debug-dashboard`
- Features: System health, performance metrics, bug reports
- Real-time monitoring and debugging tools

#### Global Debug Commands (Development)
```javascript
// Available in browser console
window.debugPanel.log('Message', data);
window.debugPanel.warn('Warning');
window.debugPanel.error('Error');
window.debugPanel.clear();
window.debugPanel.export();
```

### 🎯 Quality Targets

**Standard Pages:**
- Compliance Score: 95%+ (18+ checks)
- Code Quality: No critical issues
- Performance: <50ms render time
- Accessibility: WCAG 2.1 AA compliance

**Admin Pages:**
- Compliance Score: 85%+ (11+ checks)  
- Simplified requirements (no SidebarLayout required)
- Still requires theme integration and debugging

### 🚀 Quick Start Template

```tsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { SideCategory } from '@/components/navigation/SideCategory';
import { useGlobalTheme } from '@/contexts/GlobalThemeContext';
import { useMenuConfig } from '@/hooks/useMenuConfig';
import { DebugPanel, useDebugLogger, DebugErrorBoundary } from '@/components/debug/DebugPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BrandLogo } from '@/components/ui/brand-logo';

export default function YourNewPage() {
  const { actualTheme, themeMode } = useGlobalTheme();
  const { getMenuItems, getSections } = useMenuConfig();
  const allMenuItems = getMenuItems();
  const menuSections = getSections();
  const debug = useDebugLogger('YourNewPage');

  useEffect(() => {
    debug.info('Page mounted');
    return () => debug.info('Page unmounted');
  }, []);

  const handleAction = () => {
    debug.debug('Action triggered');
    // Your action logic here
  };

  return (
    <DebugErrorBoundary componentName="YourNewPage">
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
        <div className="p-6 bg-background text-foreground min-h-screen">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">Your Page Title</h1>
            <p className="text-muted-foreground">Page description</p>
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Content Section</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleAction}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Action Button
              </Button>
            </CardContent>
          </Card>

          <DebugPanel 
            componentName="YourNewPage" 
            position="bottom-right"
          />
        </div>
      </SidebarLayout>
    </DebugErrorBoundary>
  );
}
```

---

## 🎉 Summary

This integration guide now provides:

1. **Complete architectural patterns** for standard and admin pages
2. **Comprehensive debugging system** with real-time monitoring
3. **Advanced code quality checking** with duplication and dead feature detection  
4. **Centralized debug dashboard** for monitoring application health
5. **Step-by-step integration process** with clear quality targets
6. **Ready-to-use templates** for immediate development

The system ensures all new pages follow consistent patterns, include proper debugging support, and maintain high code quality standards. Use the compliance checker and advanced code analyzer throughout development to catch issues early and maintain system integrity.

**Next Steps:**
1. Copy the quick start template
2. Run compliance checker early and often
3. Use debug tools during development
4. Aim for 95%+ compliance before review
5. Test thoroughly across themes and devices
