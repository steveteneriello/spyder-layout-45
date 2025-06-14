
# Supabase Color Palette - Light & Dark Mode

## Dark Mode Color Palette

### Background Colors
- **Primary Background**: `#0E1117` - Main app background
- **Secondary Background**: `#161B22` - Sidebar and card backgrounds  
- **Tertiary Background**: `#21262D` - Elevated elements, modals
- **Hover Background**: `#30363D` - Hover states for interactive elements

### Border Colors
- **Primary Border**: `#30363D` - Main borders and dividers
- **Secondary Border**: `#21262D` - Subtle borders
- **Focus Border**: `#388BFD` - Focus states and active elements

### Text Colors
- **Primary Text**: `#F0F6FC` - Main text, headings
- **Secondary Text**: `#7D8590` - Muted text, descriptions
- **Tertiary Text**: `#656D76` - Disabled text, placeholders
- **White Icons**: `#F0F6FC` - Small white icons throughout UI

### Accent Colors
- **Primary Blue**: `#388BFD` - Primary buttons, links, active states
- **Blue Hover**: `#1F6FEB` - Hover state for blue elements
- **Blue Background**: `#0D1117` with blue tint - Blue button backgrounds

### Status Colors
- **Success Green**: `#3FB950` - Success states, active indicators
- **Success Background**: `#0D1B0D` - Success notification backgrounds
- **Warning Yellow**: `#D29922` - Warning states
- **Warning Background**: `#1C1611` - Warning notification backgrounds  
- **Error Red**: `#F85149` - Error states, destructive actions
- **Error Background**: `#1C0F0F` - Error notification backgrounds

### Specific Component Colors

#### Buttons
- **Primary Button**: Background `#388BFD`, Text `#FFFFFF`
- **Secondary Button**: Background `#21262D`, Border `#30363D`, Text `#F0F6FC`
- **Danger Button**: Background `#DA3633`, Text `#FFFFFF`

#### Form Elements
- **Input Background**: `#0D1117`
- **Input Border**: `#30363D`
- **Input Focus Border**: `#388BFD`
- **Input Text**: `#F0F6FC`
- **Placeholder Text**: `#656D76`

#### Cards & Panels
- **Card Background**: `#161B22`
- **Card Border**: `#30363D`
- **Panel Header**: `#21262D`

#### Tables
- **Table Header**: `#161B22`
- **Table Row**: `#0E1117`
- **Table Row Hover**: `#161B22`
- **Table Border**: `#21262D`

#### Navigation
- **Sidebar Background**: `#0E1117`
- **Nav Item**: `#7D8590`
- **Nav Item Active**: `#F0F6FC`
- **Nav Item Hover**: `#30363D`

#### Badges & Status
- **Active Badge**: Background `#1A4E2F`, Text `#3FB950`, Border `#2EA043`
- **Inactive Badge**: Background `#161B22`, Text `#7D8590`, Border `#30363D`
- **Pending Badge**: Background `#1F2937`, Text `#D29922`, Border `#D29922`
- **Processing Badge**: Background `#1E293B`, Text `#388BFD`, Border `#388BFD`

## Light Mode Color Palette

### Background Colors
- **Primary Background**: `#FFFFFF` - Main app background
- **Secondary Background**: `#FBFCFD` - Sidebar and card backgrounds  
- **Tertiary Background**: `#F8F9FA` - Elevated elements, modals
- **Hover Background**: `#F1F3F5` - Hover states for interactive elements

### Border Colors
- **Primary Border**: `#E1E8ED` - Main borders and dividers
- **Secondary Border**: `#EAEEF2` - Subtle borders
- **Focus Border**: `#3182CE` - Focus states and active elements

### Text Colors
- **Primary Text**: `#1A202C` - Main text, headings
- **Secondary Text**: `#4A5568` - Muted text, descriptions
- **Tertiary Text**: `#718096` - Disabled text, placeholders
- **Dark Icons**: `#2D3748` - Small dark icons throughout UI

### Accent Colors
- **Primary Blue**: `#3182CE` - Primary buttons, links, active states
- **Blue Hover**: `#2C5282` - Hover state for blue elements
- **Blue Background**: `#EBF8FF` - Blue button backgrounds

### Status Colors
- **Success Green**: `#38A169` - Success states, active indicators
- **Success Background**: `#F0FFF4` - Success notification backgrounds
- **Warning Orange**: `#DD6B20` - Warning states
- **Warning Background**: `#FFFAF0` - Warning notification backgrounds  
- **Error Red**: `#E53E3E` - Error states, destructive actions
- **Error Background**: `#FED7D7` - Error notification backgrounds

### Specific Component Colors

#### Buttons
- **Primary Button**: Background `#3182CE`, Text `#FFFFFF`
- **Secondary Button**: Background `#FFFFFF`, Border `#E1E8ED`, Text `#1A202C`
- **Danger Button**: Background `#E53E3E`, Text `#FFFFFF`

#### Form Elements
- **Input Background**: `#FFFFFF`
- **Input Border**: `#E1E8ED`
- **Input Focus Border**: `#3182CE`
- **Input Text**: `#1A202C`
- **Placeholder Text**: `#718096`

#### Cards & Panels
- **Card Background**: `#FFFFFF`
- **Card Border**: `#E1E8ED`
- **Panel Header**: `#F8F9FA`

#### Tables
- **Table Header**: `#F8F9FA`
- **Table Row**: `#FFFFFF`
- **Table Row Hover**: `#F7FAFC`
- **Table Border**: `#E1E8ED`

#### Navigation
- **Sidebar Background**: `#FBFCFD`
- **Nav Item**: `#4A5568`
- **Nav Item Active**: `#1A202C`
- **Nav Item Hover**: `#F1F3F5`

#### Badges & Status
- **Active Badge**: Background `#C6F6D5`, Text `#22543D`, Border `#38A169`
- **Inactive Badge**: Background `#F7FAFC`, Text `#4A5568`, Border `#E1E8ED`
- **Pending Badge**: Background `#FFF5CC`, Text `#744210`, Border `#DD6B20`
- **Processing Badge**: Background `#EBF8FF`, Text `#2A4365`, Border `#3182CE`

## Tailwind CSS Classes for Quick Reference

### Dark Mode Classes
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

### Light Mode Classes
```css
/* Backgrounds */
bg-white           /* Primary background */
bg-[#FBFCFD]      /* Secondary background */
bg-[#F8F9FA]      /* Tertiary background */
bg-[#F1F3F5]      /* Hover background */

/* Borders */
border-[#E1E8ED]  /* Primary border */
border-[#EAEEF2]  /* Secondary border */
border-[#3182CE]  /* Focus border */

/* Text */
text-[#1A202C]    /* Primary text */
text-[#4A5568]    /* Secondary text */
text-[#718096]    /* Tertiary text */

/* Accents */
bg-[#3182CE]      /* Primary blue */
hover:bg-[#2C5282] /* Blue hover */
text-[#3182CE]    /* Blue text */

/* Status */
text-[#38A169]    /* Success */
text-[#DD6B20]    /* Warning */
text-[#E53E3E]    /* Error */
```

## Usage Examples

### Dark Mode Examples

#### Primary Button
```jsx
<button className="bg-[#388BFD] hover:bg-[#1F6FEB] text-white border border-[#388BFD] px-4 py-2 rounded-lg text-sm font-medium transition-colors">
  Primary Action
</button>
```

#### Card Component
```jsx
<div className="bg-[#161B22] border border-[#30363D] rounded-lg p-6">
  <h3 className="text-[#F0F6FC] font-medium mb-2">Card Title</h3>
  <p className="text-[#7D8590] text-sm">Card description text</p>
</div>
```

#### Status Badge
```jsx
<span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-[#1A4E2F] text-[#3FB950] border border-[#2EA043]">
  <CheckCircle className="w-3 h-3" />
  Active
</span>
```

### Light Mode Examples

#### Primary Button
```jsx
<button className="bg-[#3182CE] hover:bg-[#2C5282] text-white border border-[#3182CE] px-4 py-2 rounded-lg text-sm font-medium transition-colors">
  Primary Action
</button>
```

#### Card Component
```jsx
<div className="bg-white border border-[#E1E8ED] rounded-lg p-6 shadow-sm">
  <h3 className="text-[#1A202C] font-medium mb-2">Card Title</h3>
  <p className="text-[#4A5568] text-sm">Card description text</p>
</div>
```

#### Status Badge
```jsx
<span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-[#C6F6D5] text-[#22543D] border border-[#38A169]">
  <CheckCircle className="w-3 h-3" />
  Active
</span>
```

## Dark vs Light Mode Toggle

### Theme Provider Setup
```tsx
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={theme}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};
```

### Theme-Aware Classes
```tsx
const getThemeClasses = (theme: 'light' | 'dark') => ({
  background: theme === 'light' ? 'bg-white' : 'bg-[#0E1117]',
  cardBackground: theme === 'light' ? 'bg-white' : 'bg-[#161B22]',
  border: theme === 'light' ? 'border-[#E1E8ED]' : 'border-[#30363D]',
  text: theme === 'light' ? 'text-[#1A202C]' : 'text-[#F0F6FC]',
  textMuted: theme === 'light' ? 'text-[#4A5568]' : 'text-[#7D8590]',
  button: theme === 'light' ? 'bg-[#3182CE] hover:bg-[#2C5282]' : 'bg-[#388BFD] hover:bg-[#1F6FEB]'
});
```
