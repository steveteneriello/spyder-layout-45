# New Page Integration Guide

This guide ensures new pages are fully integrated with the design system and centralized menu configuration.

## Quick Start Checklist

### 1. Basic Setup
- [ ] Create your new page component in `/src/pages/` or appropriate subdirectory
- [ ] Use TypeScript (.tsx extension)
- [ ] Export as default component
- [ ] Import and use the centralized theme and menu system

### 2. Required Imports
```tsx
import { useGlobalTheme } from '@/contexts/GlobalThemeContext';
import { useMenuConfig } from '@/hooks/useMenuConfig';
import { SidebarLayout } from '@/components/layout/SidebarLayout';
import { SideCategory } from '@/components/navigation/SideCategory';
```

### 3. Basic Page Structure Template
```tsx
import React from 'react';
import { useGlobalTheme } from '@/contexts/GlobalThemeContext';
import { useMenuConfig } from '@/hooks/useMenuConfig';
import { SidebarLayout } from '@/components/layout/SidebarLayout';
import { SideCategory } from '@/components/navigation/SideCategory';

export default function YourNewPage() {
  const { currentTheme } = useGlobalTheme();
  const { getSections } = useMenuConfig();
  const menuSections = getSections();

  return (
    <SidebarLayout
      category={
        <div className="space-y-4">
          {menuSections.map((section) => (
            <SideCategory
              key={section.name}
              title={section.name}
              items={section.items}
            />
          ))}
        </div>
      }
      menuItems={[]} // Legacy prop, keep empty
    >
      <div className={`flex-1 ${currentTheme.background} ${currentTheme.text} min-h-screen`}>
        <div className={`${currentTheme.cardBackground} rounded-lg shadow-sm border ${currentTheme.border}`}>
          {/* Your page content here */}
          <div className="p-6">
            <h1 className={`text-2xl font-bold ${currentTheme.text} mb-6`}>
              Your Page Title
            </h1>
            {/* Add your content */}
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
```

## Design System Guidelines

### 4. Theme Integration
- **NEVER use hardcoded colors** (e.g., `bg-white`, `text-black`)
- **ALWAYS use theme variables** from `useGlobalTheme()`
- **Required theme classes:**
  - Background: `currentTheme.background`
  - Text: `currentTheme.text`
  - Cards: `currentTheme.cardBackground`
  - Borders: `currentTheme.border`
  - Primary: `currentTheme.primary`
  - Secondary: `currentTheme.secondary`

### 5. Layout Structure
- **Main container:** Must have `flex-1`, background, text, and `min-h-screen`
- **Content cards:** Use `cardBackground`, `rounded-lg`, `shadow-sm`, `border`
- **Spacing:** Use consistent padding (`p-6`, `p-4`) and margins (`mb-6`, `mb-4`)
- **Typography:** Use Tailwind typography classes with theme text colors

### 6. Menu Integration
- **Use `getSections()`** from `useMenuConfig` for sidebar menu
- **Map over sections** and render `SideCategory` components
- **Keep `menuItems={[]}`** prop for legacy compatibility
- **NO hardcoded menu arrays** in individual pages

### 7. Navigation
- Use React Router `Link` components for navigation
- Ensure proper active state handling (handled by `SideCategory`)
- Test navigation between pages

## Adding Your Page to the Menu

### 8. Update Menu Configuration
Edit `/src/hooks/useMenuConfig.ts` to add your page:

```tsx
// In the appropriate section's items array:
{
  id: 'your-page-id',
  title: 'Your Page Title',
  path: '/your-page-path',
  icon: 'YourIcon', // Lucide icon name
  order: X, // Position in section
  isVisible: true
}
```

### 9. Add Route to App
Update your routing configuration to include the new page route.

## Responsive Design

### 10. Mobile Responsiveness
- Test on mobile devices (use browser dev tools)
- Use responsive utilities (`sm:`, `md:`, `lg:`)
- Ensure sidebar collapses properly on mobile
- Content should be readable and usable on all screen sizes

### 11. Accessibility
- Use semantic HTML elements
- Add proper ARIA labels where needed
- Ensure keyboard navigation works
- Test with screen readers if possible
- Maintain proper color contrast ratios

## Common Mistakes to Avoid

### ❌ Don't Do This:
```tsx
// Hardcoded colors
<div className="bg-white text-black border-gray-200">

// Hardcoded menu arrays
const sidebarItems = [
  { title: 'Dashboard', path: '/' },
  // ...
];

// Direct color values
style={{ backgroundColor: '#ffffff' }}

// Missing theme integration
<div className="some-content">
```

### ✅ Do This:
```tsx
// Use theme variables
<div className={`${currentTheme.cardBackground} ${currentTheme.text} ${currentTheme.border}`}>

// Use centralized menu
const menuSections = getSections();

// Theme-aware styling
<div className={`${currentTheme.background} ${currentTheme.text}`}>
```

## Testing Your Integration

### 12. Manual Testing Checklist
- [ ] Page loads without errors
- [ ] Sidebar menu appears correctly
- [ ] Navigation between pages works
- [ ] Theme switching works (light/dark mode)
- [ ] Responsive design works on mobile
- [ ] No console errors or warnings
- [ ] TypeScript compilation succeeds

### 13. Automated Testing
Run the compliance checker:
```bash
node compliance-checker.js src/pages/YourNewPage.tsx
```

## Advanced Features

### 14. Custom Components
- Reuse existing components from `/src/components/ui/`
- Follow the established component patterns
- Use shadcn/ui components when possible

### 15. State Management
- Use React hooks for local state
- Consider context for shared state
- Follow existing patterns in the codebase

### 16. Data Fetching
- Use custom hooks (see `/src/hooks/` for examples)
- Handle loading and error states
- Follow established API patterns

## Getting Help

- Check existing pages for examples (`/src/pages/`)
- Review component documentation in `/src/components/`
- Use the compliance checker for validation
- Ask the team for code review before merging

## Example: Complete New Page

Here's a complete example of a properly integrated page:

```tsx
import React, { useState } from 'react';
import { useGlobalTheme } from '@/contexts/GlobalThemeContext';
import { useMenuConfig } from '@/hooks/useMenuConfig';
import { SidebarLayout } from '@/components/layout/SidebarLayout';
import { SideCategory } from '@/components/navigation/SideCategory';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ExampleNewPage() {
  const { currentTheme } = useGlobalTheme();
  const { getSections } = useMenuConfig();
  const menuSections = getSections();
  const [count, setCount] = useState(0);

  return (
    <SidebarLayout
      category={
        <div className="space-y-4">
          {menuSections.map((section) => (
            <SideCategory
              key={section.name}
              title={section.name}
              items={section.items}
            />
          ))}
        </div>
      }
      menuItems={[]}
    >
      <div className={`flex-1 ${currentTheme.background} ${currentTheme.text} min-h-screen`}>
        <div className="p-6">
          <Card className={`${currentTheme.cardBackground} ${currentTheme.border}`}>
            <CardHeader>
              <CardTitle className={currentTheme.text}>
                Example New Page
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`${currentTheme.text} mb-4`}>
                This is an example of a properly integrated page.
              </p>
              <div className="space-y-4">
                <p className={currentTheme.text}>Count: {count}</p>
                <Button
                  onClick={() => setCount(count + 1)}
                  className={currentTheme.primary}
                >
                  Increment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  );
}
```

This example demonstrates:
- ✅ Proper imports
- ✅ Theme integration
- ✅ Centralized menu usage
- ✅ Responsive layout
- ✅ Component reuse
- ✅ TypeScript usage
- ✅ Semantic structure
