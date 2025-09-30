'use client';

import React, { useEffect, useState } from 'react';
import { getApps, initializeApp, getApp } from 'firebase/app';
import { getAuth, signInWithCustomToken } from 'firebase/auth';

const cfg = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
};
const app = getApps().length ? getApp() : initializeApp(cfg);
const auth = getAuth(app);

export default function LinkedInDebug() {
  const [status, setStatus] = useState('idle');
  const [payload, setPayload] = useState<any>(null);
  const [customToken, setCustomToken] = useState<string | null>(null);

  useEffect(() => {
    // If we returned to this page with ?code=..., call the callback to exchange
    const qs = window.location.search;
    if (qs.includes('code=')) {
      (async () => {
        setStatus('exchanging...');
        const res = await fetch('/api/linkedin/callback' + qs);
        const json = await res.json();
        setPayload(json);
        if (json.customToken) setCustomToken(json.customToken);
        setStatus(res.ok ? 'token ready' : 'error');
        // remove query from URL
        window.history.replaceState({}, '', window.location.pathname);
      })();
    }
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>LinkedIn → Firebase Debug</h1>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => (window.location.href = '/api/linkedin/start')}>Start (PKCE)</button>
        <button onClick={() => (window.location.href = '/api/linkedin/start-no-pkce')}>Start (No PKCE)</button>
        <button disabled={!customToken} onClick={async () => {
          setStatus('signing in...');
          try {
            await signInWithCustomToken(auth, customToken!);
            setStatus('✅ signed in');
          } catch (e: any) {
            console.error(e);
            setStatus('❌ ' + (e?.code || e?.message || 'sign-in error'));
          }
        }}>Sign in with Custom Token</button>
      </div>
      <div style={{ marginTop: 12 }}>Status: {status}</div>
      <pre style={{ whiteSpace: 'pre-wrap', marginTop: 12 }}>
        {payload ? JSON.stringify(payload, null, 2) : 'No payload yet.'}
      </pre>
    </div>
  );
}