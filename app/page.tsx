'use client';

import { useUser, SignInButton, SignUpButton } from '@clerk/nextjs';
import { useState } from 'react';

export default function Home() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [appId, setAppId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  console.log('User state:', { isSignedIn, userId: user?.id, isLoaded }); // Отладка

  const requestAccess = async () => {
    if (!user?.id || !appId) {
      alert('Please sign in and select an app');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/request-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id, appId }),
      });
      const result = await response.json();
      console.log('API response:', result); // Отладка
      alert(result.message);
    } catch (error) {
      console.error('Error requesting access:', error);
      alert('Error requesting access');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Test Clerk Authentication</h1>
      {!isSignedIn ? (
        <div>
          <SignInButton mode="modal">
            <button>Sign In</button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button>Sign Up</button>
          </SignUpButton>
        </div>
      ) : (
        <div>
          <p>Welcome, {user?.firstName}</p>
          <select
            value={appId}
            onChange={(e) => {
              console.log('Selected appId:', e.target.value); // Отладка
              setAppId(e.target.value);
            }}
          >
            <option value="">Select App</option>
            <option value="weather">Weather</option>
            <option value="notes">Notes</option>
          </select>
          <button onClick={requestAccess} disabled={!appId || isLoading}>
            {isLoading ? 'Requesting...' : 'Request Access'}
          </button>
        </div>
      )}
    </div>
  );
}