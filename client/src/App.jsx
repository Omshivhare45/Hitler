import React from 'react';
import { ClerkProvider } from '@clerk/clerk-react';
import Dashboard from './components/Dashboard';

// Import your publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  console.warn("Missing VITE_CLERK_PUBLISHABLE_KEY. Please add it to your .env file.");
}

function App() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} appearance={{ baseTheme: 'dark' }}>
      <div className="app">
        <Dashboard />
      </div>
    </ClerkProvider>
  );
}

export default App;
