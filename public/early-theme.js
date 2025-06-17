// Early Theme Detection Script
// This script MUST run before React to prevent theme flash
(function() {
  'use strict';
  
  console.log('🚀 Early theme detection starting...');
  
  // Get stored theme preference - check both possible keys
  function getStoredTheme() {
    try {
      return localStorage.getItem('theme-preference') || localStorage.getItem('theme-mode') || 'auto';
    } catch (e) {
      return 'auto';
    }
  }
  
  // Get system theme preference
  function getSystemTheme() {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }
  
  // Apply theme immediately with critical CSS injection
  function applyTheme() {
    const themeMode = getStoredTheme();
    const actualTheme = themeMode === 'auto' ? getSystemTheme() : themeMode;
    
    console.log(`🎨 Early theme application: ${themeMode} -> ${actualTheme}`);
    
    // Set data attribute and class IMMEDIATELY
    document.documentElement.setAttribute('data-theme', actualTheme);
    document.documentElement.className = actualTheme === 'dark' ? 'dark' : '';
    
    // Remove any existing early theme styles
    const existing = document.getElementById('early-theme-critical');
    if (existing) existing.remove();
    
    // Apply critical CSS immediately to prevent flash
    const criticalStyle = document.createElement('style');
    criticalStyle.id = 'early-theme-critical';
    
    if (actualTheme === 'dark') {
      criticalStyle.textContent = `
        /* Dark Mode Critical Styles - Applied Before React */
        :root {
          --background: 222.2 84% 4.9%;
          --foreground: 210 40% 98%;
          --bg-primary: 14, 17, 23;
          --text-primary: 240, 246, 252;
          --bg-secondary: 22, 27, 34;
          --primary: 217 91% 60%;
          --muted: 215 27.9% 16.9%;
          --card: 222.2 84% 4.9%;
          --border: 217.2 32.6% 17.5%;
        }
        
        html, body {
          background-color: #0E1117 !important;
          color: #F0F6FC !important;
          transition: none !important;
        }
        
        #root {
          background-color: #0E1117 !important;
          color: #F0F6FC !important;
        }
        
        /* Ensure immediate dark styling */
        .bg-background { background-color: #0E1117 !important; }
        .bg-card { background-color: #161B22 !important; }
        .bg-secondary { background-color: #161B22 !important; }
        .text-foreground { color: #F0F6FC !important; }
        .text-muted-foreground { color: #7D8590 !important; }
        
        /* Prevent any light backgrounds during load */
        * {
          border-color: #30363D !important;
        }
        
        /* Loading states */
        [data-loading="true"] {
          background-color: #0E1117 !important;
          color: #F0F6FC !important;
        }
      `;
    } else {
      criticalStyle.textContent = `
        /* Light Mode Critical Styles - Applied Before React */
        :root {
          --background: 0 0% 100%;
          --foreground: 222.2 84% 4.9%;
          --bg-primary: 255, 255, 255;
          --text-primary: 26, 32, 44;
          --bg-secondary: 251, 252, 253;
          --primary: 221.2 83.2% 53.3%;
          --muted: 210 40% 96%;
          --card: 0 0% 100%;
          --border: 214.3 31.8% 91.4%;
        }
        
        html, body {
          background-color: #FFFFFF !important;
          color: #1A202C !important;
          transition: none !important;
        }
        
        #root {
          background-color: #FFFFFF !important;
          color: #1A202C !important;
        }
        
        /* Ensure immediate light styling */
        .bg-background { background-color: #FFFFFF !important; }
        .bg-card { background-color: #FBFCFD !important; }
        .bg-secondary { background-color: #FBFCFD !important; }
        .text-foreground { color: #1A202C !important; }
        .text-muted-foreground { color: #4A5568 !important; }
        
        /* Light mode borders */
        * {
          border-color: #E2E8F0 !important;
        }
        
        /* Loading states */
        [data-loading="true"] {
          background-color: #FFFFFF !important;
          color: #1A202C !important;
        }
      `;
    }
    
    // Insert critical styles at the very beginning of head
    if (document.head.firstChild) {
      document.head.insertBefore(criticalStyle, document.head.firstChild);
    } else {
      document.head.appendChild(criticalStyle);
    }
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', 
        actualTheme === 'dark' ? '#0E1117' : '#FFFFFF'
      );
    }
    
    console.log('✅ Early theme applied successfully with critical CSS');
  }
  
  // Apply theme immediately when script loads
  applyTheme();
  
  // Listen for system theme changes (if auto mode)
  if (typeof window !== 'undefined' && window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function() {
      if (getStoredTheme() === 'auto') {
        console.log('🔄 System theme changed, re-applying early theme');
        applyTheme();
      }
    });
  }
  
  // Listen for localStorage changes (for navigation/theme switching)
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', function(e) {
      if (e.key === 'theme-preference' || e.key === 'theme-mode') {
        console.log('🔄 Theme preference changed in localStorage, re-applying early theme');
        applyTheme();
      }
    });
    
    // Also listen for theme changes within the same tab (for immediate updates)
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
      originalSetItem.apply(this, arguments);
      if (key === 'theme-preference' || key === 'theme-mode') {
        console.log('🔄 Theme preference changed locally, re-applying early theme');
        setTimeout(applyTheme, 0); // Apply on next tick
      }
    };
  }
  
  // Expose functions for React to use
  window.__EARLY_THEME_APPLIED__ = true;
  window.__APPLY_EARLY_THEME__ = applyTheme;
  window.__GET_EARLY_THEME__ = function() {
    const themeMode = getStoredTheme();
    return themeMode === 'auto' ? getSystemTheme() : themeMode;
  };
  
  // Special handling for client-side navigation to prevent flash
  if (typeof window !== 'undefined') {
    // Listen for pushState/replaceState (React Router navigation)
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function() {
      console.log('🚀 Navigation detected (pushState), applying early theme');
      applyTheme();
      originalPushState.apply(history, arguments);
    };
    
    history.replaceState = function() {
      console.log('🚀 Navigation detected (replaceState), applying early theme');
      applyTheme();
      originalReplaceState.apply(history, arguments);
    };
    
    // Listen for popstate (back/forward navigation)
    window.addEventListener('popstate', function() {
      console.log('🚀 Navigation detected (popstate), applying early theme');
      applyTheme();
    });
    
    // Listen for hashchange
    window.addEventListener('hashchange', function() {
      console.log('🚀 Navigation detected (hashchange), applying early theme');
      applyTheme();
    });
  }
  
  console.log('🎯 Early theme detection complete');
})();
