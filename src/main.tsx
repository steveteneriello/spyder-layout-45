
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './styles/globals.css'
import './styles/theme-components.css'

// Ensure early theme detection runs before React starts
console.log('🚀 React starting - checking early theme sync...');
if (typeof window !== 'undefined' && window.__EARLY_THEME_APPLIED__) {
  console.log('✅ Early theme detection already applied');
  // Re-apply to ensure consistency before React renders
  if (window.__APPLY_EARLY_THEME__) {
    window.__APPLY_EARLY_THEME__();
  }
} else {
  console.warn('⚠️ Early theme detection not found - theme flash may occur');
}

createRoot(document.getElementById("root")!).render(<App />);
