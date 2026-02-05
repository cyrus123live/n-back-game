import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App';
import './index.css';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

console.log('[Unreel] VITE_CLERK_PUBLISHABLE_KEY present:', !!clerkPubKey);
console.log('[Unreel] VITE_CLERK_PUBLISHABLE_KEY value:', clerkPubKey ? `${clerkPubKey.slice(0, 10)}...` : 'undefined');
console.log('[Unreel] All VITE_ env vars:', Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')));

if (!clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY environment variable');
}

function Root() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <App />
    </ClerkProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
