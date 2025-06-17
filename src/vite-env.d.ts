/// <reference types="vite/client" />

// Early theme detection globals
declare global {
  interface Window {
    __EARLY_THEME_APPLIED__?: boolean;
    __APPLY_EARLY_THEME__?: () => void;
    __GET_EARLY_THEME__?: () => string;
  }
}
