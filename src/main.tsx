import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App';
import './index.css';
import { applyTheme, getPreferredTheme } from './lib/theme';

// Apply theme before render to prevent flash-of-wrong-theme
applyTheme(getPreferredTheme());

// Listen for system preference changes (only fires when no manual preference stored)
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (!localStorage.getItem('unreel-theme')) {
    applyTheme(getPreferredTheme());
  }
});

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;

console.log('[Unreel] VITE_CLERK_PUBLISHABLE_KEY present:', !!clerkPubKey);
console.log('[Unreel] VITE_CLERK_PUBLISHABLE_KEY value:', clerkPubKey ? `${clerkPubKey.slice(0, 10)}...` : 'undefined');
console.log('[Unreel] All VITE_ env vars:', Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')));

if (!clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY environment variable');
}

const publishableKey: string = clerkPubKey;

function Root() {
  return (
    <ClerkProvider publishableKey={publishableKey}>
      <App />
    </ClerkProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
