'use client';

import React, { useState } from 'react';
import { auth, signInGooglePopup, signInLinkedInPopup, signInLinkedInRedirect } from '@/lib/firebase';

export default function FirebaseDiagPage() {
  const [state, setState] = useState<any>({});

  async function run(label: string, fn: () => Promise<any>) {
    setState((s: any) => ({ ...s, [label]: 'working...' }));
    try {
      await fn();
      setState((s: any) => ({ ...s, [label]: '✅ success' }));
    } catch (e: any) {
      setState((s: any) => ({ ...s, [label]: `❌ ${e?.code || e?.message || e}` }));
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Firebase Auth Diagnostics</h1>
      <p>Open DevTools → Console. Click tests below.</p>

      <div style={{ display: 'grid', gap: 8, marginTop: 16 }}>
        <button onClick={() => run('linkedin_popup', signInLinkedInPopup)}>Test LinkedIn (Popup)</button>
        <button onClick={() => run('linkedin_redirect', signInLinkedInRedirect)}>Test LinkedIn (Redirect)</button>
        <button onClick={() => run('google_popup', signInGooglePopup)}>Test Google (Popup)</button>

        <div style={{ margin: '16px 0', borderTop: '1px solid #ddd', paddingTop: '16px' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>Custom Token Implementation:</h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <a
              href="/auth/linkedin-custom"
              style={{
                display: 'inline-block',
                padding: '8px 16px',
                backgroundColor: '#0077b5',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              🔗 Test LinkedIn Custom Token Auth
            </a>
            <a
              href="/auth/logout"
              style={{
                display: 'inline-block',
                padding: '8px 16px',
                backgroundColor: '#dc3545',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              🚪 Sign Out (to test auth)
            </a>
          </div>
        </div>
      </div>

      <pre style={{ marginTop: 16 }}>{JSON.stringify(state, null, 2)}</pre>
      <p style={{marginTop: 12}}>Project: {auth.app.options.projectId} · Domain: {auth.config.authDomain}</p>
    </div>
  );
}