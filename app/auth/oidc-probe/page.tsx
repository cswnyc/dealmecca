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

async function probeCreateAuthUri() {
  const key = auth.app.options.apiKey!;
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:createAuthUri?key=${key}`;
  const body = {
    continueUri: window.location.origin,
    providerId: 'oidc.linkedin', // full code-side providerId
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  return { status: res.status, json };
}

export default function OIDCProbePage() {
  const [out, setOut] = useState<any>(null);

  const run = async () => {
    const snapshot = {
      projectId: auth.app.options.projectId,
      authDomain: auth.config.authDomain,
      apiKey: auth.app.options.apiKey,
      locationHost: window.location.host,
      expectedRedirect: `https://${auth.config.authDomain}/__/auth/handler`,
    };
    console.table(snapshot);

    try {
      const result = await probeCreateAuthUri();
      console.log('createAuthUri result:', result);
      setOut({ snapshot, result });
    } catch (e: any) {
      console.error('createAuthUri failed:', e);
      setOut({ snapshot, error: { message: e?.message, name: e?.name } });
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>OIDC Enablement Probe</h1>
      <p>This calls identitytoolkit "createAuthUri" with providerId = "oidc.linkedin".</p>
      <button onClick={run}>Run Probe</button>
      <pre style={{ marginTop: 16, whiteSpace: 'pre-wrap' }}>
        {out ? JSON.stringify(out, null, 2) : 'No output yet.'}
      </pre>
    </div>
  );
}