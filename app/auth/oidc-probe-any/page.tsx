'use client';

import React, { useState } from 'react';
import { getApps, initializeApp, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const cfg = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
};

const app = getApps().length ? getApp() : initializeApp(cfg);
const auth = getAuth(app);

async function probe(providerId: string) {
  const key = auth.app.options.apiKey!;
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:createAuthUri?key=${key}`;
  const body = { continueUri: window.location.origin, providerId };
  const res = await fetch(url, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) });
  return { status: res.status, json: await res.json() };
}

export default function Page() {
  const [pid, setPid] = useState('oidc.linkedin');
  const [out, setOut] = useState<any>(null);

  const run = async () => {
    const snapshot = {
      projectId: auth.app.options.projectId,
      authDomain: auth.config.authDomain,
      locationHost: window.location.host,
    };
    console.table(snapshot);
    const result = await probe(pid);
    console.log('probe result:', result);
    setOut({ snapshot, pid, result });
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>OIDC ProviderId Probe</h1>
      <p>Try providerId values like: <code>oidc.linkedin</code></p>
      <input value={pid} onChange={e => setPid(e.target.value)} style={{ width: 360 }} />
      <button onClick={run} style={{ marginLeft: 8 }}>Run</button>
      <pre style={{ marginTop: 16, whiteSpace: 'pre-wrap' }}>{out ? JSON.stringify(out, null, 2) : 'No output yet.'}</pre>
    </div>
  );
}