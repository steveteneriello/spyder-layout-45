
# Supabase Dark Mode Color Palette

## Background Colors
- **Primary Background**: `#0E1117` - Main app background
- **Secondary Background**: `#161B22` - Sidebar and card backgrounds  
- **Tertiary Background**: `#21262D` - Elevated elements, modals
- **Hover Background**: `#30363D` - Hover states for interactive elements

## Border Colors
- **Primary Border**: `#30363D` - Main borders and dividers
- **Secondary Border**: `#21262D` - Subtle borders
- **Focus Border**: `#388BFD` - Focus states and active elements

## Text Colors
- **Primary Text**: `#F0F6FC` - Main text, headings
- **Secondary Text**: `#7D8590` - Muted text, descriptions
- **Tertiary Text**: `#656D76` - Disabled text, placeholders
- **White Icons**: `#F0F6FC` - Small white icons throughout UI

## Accent Colors
- **Primary Blue**: `#388BFD` - Primary buttons, links, active states
- **Blue Hover**: `#1F6FEB` - Hover state for blue elements
- **Blue Background**: `#0D1117` with blue tint - Blue button backgrounds

## Status Colors
- **Success Green**: `#3FB950` - Success states, active indicators
- **Success Background**: `#0D1B0D` - Success notification backgrounds
- **Warning Yellow**: `#D29922` - Warning states
- **Warning Background**: `#1C1611` - Warning notification backgrounds  
- **Error Red**: `#F85149` - Error states, destructive actions
- **Error Background**: `#1C0F0F` - Error notification backgrounds

## Specific Component Colors

### Buttons
- **Primary Button**: Background `#388BFD`, Text `#FFFFFF`
- **Secondary Button**: Background `#21262D`, Border `#30363D`, Text `#F0F6FC`
- **Danger Button**: Background `#DA3633`, Text `#FFFFFF`

### Form Elements
- **Input Background**: `#0D1117`
- **Input Border**: `#30363D`
- **Input Focus Border**: `#388BFD`
- **Input Text**: `#F0F6FC`
- **Placeholder Text**: `#656D76`

### Cards & Panels
- **Card Background**: `#161B22`
- **Card Border**: `#30363D`
- **Panel Header**: `#21262D`

### Tables
- **Table Header**: `#161B22`
- **Table Row**: `#0E1117`
- **Table Row Hover**: `#161B22`
- **Table Border**: `#21262D`

### Navigation
- **Sidebar Background**: `#0E1117`
- **Nav Item**: `#7D8590`
- **Nav Item Active**: `#F0F6FC`
- **Nav Item Hover**: `#30363D`

### Badges & Status
- **Active Badge**: Background `#1A4E2F`, Text `#3FB950`, Border `#2EA043`
- **Inactive Badge**: Background `#161B22`, Text `#7D8590`, Border `#30363D`
- **Pending Badge**: Background `#1F2937`, Text `#D29922`, Border `#D29922`
- **Processing Badge**: Background `#1E293B`, Text `#388BFD`, Border `#388BFD`

## Tailwind CSS Classes for Quick Reference

```css
/* Backgrounds */
bg-[#0E1117]  /* Primary background */
bg-[#161B22]  /* Secondary background */
bg-[#21262D]  /* Tertiary background */
bg-[#30363D]  /* Hover background */

/* Borders */
border-[#30363D]  /* Primary border */
border-[#21262D]  /* Secondary border */
border-[#388BFD]  /* Focus border */

/* Text */
text-[#F0F6FC]  /* Primary text */
text-[#7D8590]  /* Secondary text */
text-[#656D76]  /* Tertiary text */

/* Accents */
bg-[#388BFD]    /* Primary blue */
hover:bg-[#1F6FEB]  /* Blue hover */
text-[#388BFD]  /* Blue text */

/* Status */
text-[#3FB950]  /* Success */
text-[#D29922]  /* Warning */
text-[#F85149]  /* Error */
```

## Usage Examples

### Primary Button
```jsx
<button className="bg-[#388BFD] hover:bg-[#1F6FEB] text-white border border-[#388BFD] px-4 py-2 rounded-lg text-sm font-medium transition-colors">
  Primary Action
</button>
```

### Card Component
```jsx
<div className="bg-[#161B22] border border-[#30363D] rounded-lg p-6">
  <h3 className="text-[#F0F6FC] font-medium mb-2">Card Title</h3>
  <p className="text-[#7D8590] text-sm">Card description text</p>
</div>
```

### Status Badge
```jsx
<span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-[#1A4E2F] text-[#3FB950] border border-[#2EA043]">
  <CheckCircle className="w-3 h-3" />
  Active
</span>
```
