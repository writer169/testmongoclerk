'use client';

import { useUser, SignInButton, SignUpButton } from '@clerk/nextjs';
import { useState } from 'react';

export default function Home() {
  const { isSignedIn, user } = useUser();
  const [appId, setAppId] = useState('');

  const requestAccess = async () => {
    try {
      const response = await fetch('/api/request-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user?.id, appId }),
      });
      const result = await response.json();
      alert(result.message);
    } catch (error) {
      console.error('Error requesting access:', error);
      alert('Error requesting access');
    }
  };

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
          <select onChange={(e) => setAppId(e.target.value)}>
            <option value="">Select App</option>
            <option value="weather">Weather</option>
            <option value="notes">Notes</option>
          </select>
          <button onClick={requestAccess} disabled={!appId}>
            Request Access
          </button>
        </div>
      )}
    </div>
  );
}