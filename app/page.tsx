'use client';

import { useUser, SignInButton, SignUpButton } from '@clerk/nextjs';
import { useState, useEffect } from 'react';

export default function Home() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [appId, setAppId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Отладка состояния пользователя
  useEffect(() => {
    console.log('User state:', { isSignedIn, userId: user?.id, isLoaded });
  }, [isSignedIn, user, isLoaded]);

  const requestAccess = async () => {
    if (!user?.id || !appId) {
      setMessage('Please sign in and select an app');
      return;
    }

    setIsLoading(true);
    setMessage(null);
    try {
      const response = await fetch('/api/request-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
  userId: user.id,
  appId,
  userEmail: user.emailAddresses[0]?.emailAddress || null,
  userFirstName: user.firstName || null,
  userLastName: user.lastName || null,
}),
      });
      const result = await response.json();
      console.log('API response:', result);
      setMessage(result.message);
    } catch (error) {
      console.error('Error requesting access:', error);
      setMessage('Error requesting access');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded) {
    return <div>Loading user data...</div>;
  }

  return (
    <div>
      <h1>Test Clerk Authentication</h1>
      {message && <p style={{ color: message.includes('Error') ? 'red' : 'green' }}>{message}</p>}
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
          <p>Welcome, {user?.firstName || 'User'}!</p>
          <select
            value={appId}
            onChange={(e) => {
              console.log('Selected appId:', e.target.value);
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