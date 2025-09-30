'use client';

import { useEffect, useState } from 'react';

export default function DebugConfigPage() {
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    // Get Firebase config from runtime
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };

    const linkedInConfig = {
      clientId: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID,
    };

    setConfig({ firebaseConfig, linkedInConfig });

    // Also log to console for easy inspection
    console.log('🔥 Firebase Runtime Config:', firebaseConfig);
    console.log('🔗 LinkedIn Config:', linkedInConfig);
    console.log('📄 Next.js Data:', typeof window !== 'undefined' ? (window as any).__NEXT_DATA__ : 'server-side');
  }, []);

  if (!config) {
    return <div className="p-8">Loading configuration...</div>;
  }

  const { firebaseConfig, linkedInConfig } = config;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🔥 Firebase Configuration Debug</h1>

      <div className="space-y-6">
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Firebase Configuration</h2>
          <div className="space-y-2 font-mono text-sm">
            <div>Project ID: <span className="text-blue-600">{firebaseConfig.projectId}</span></div>
            <div>Auth Domain: <span className="text-blue-600">{firebaseConfig.authDomain}</span></div>
            <div>API Key: <span className="text-green-600">{firebaseConfig.apiKey ? '✅ Set' : '❌ Missing'}</span></div>
            <div>Storage Bucket: <span className="text-blue-600">{firebaseConfig.storageBucket}</span></div>
            <div>App ID: <span className="text-blue-600">{firebaseConfig.appId}</span></div>
          </div>
        </div>

        <div className="bg-blue-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Expected vs Actual</h2>
          <div className="space-y-2 font-mono text-sm">
            <div>
              Expected Project: <span className="text-gray-600">dealmecca-6cea8</span><br/>
              Actual Project: <span className={firebaseConfig.projectId === 'dealmecca-6cea8' ? 'text-green-600' : 'text-red-600'}>
                {firebaseConfig.projectId} {firebaseConfig.projectId === 'dealmecca-6cea8' ? '✅' : '❌'}
              </span>
            </div>
            <div>
              Expected Domain: <span className="text-gray-600">dealmecca-6cea8.firebaseapp.com</span><br/>
              Actual Domain: <span className={firebaseConfig.authDomain === 'dealmecca-6cea8.firebaseapp.com' ? 'text-green-600' : 'text-red-600'}>
                {firebaseConfig.authDomain} {firebaseConfig.authDomain === 'dealmecca-6cea8.firebaseapp.com' ? '✅' : '❌'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">LinkedIn Configuration</h2>
          <div className="space-y-2 font-mono text-sm">
            <div>Client ID: <span className="text-blue-600">{linkedInConfig.clientId || 'Not set'}</span></div>
            <div>Expected Client ID: <span className="text-gray-600">86de7r9h24e1oe</span></div>
            <div>Match: <span className={linkedInConfig.clientId === '86de7r9h24e1oe' ? 'text-green-600' : 'text-red-600'}>
              {linkedInConfig.clientId === '86de7r9h24e1oe' ? '✅ Yes' : '❌ No'}
            </span></div>
          </div>
        </div>

        <div className="bg-green-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Required Firebase Console Setup</h2>
          <div className="space-y-2 font-mono text-sm">
            <div>Provider Type: <span className="font-semibold">OpenID Connect (OIDC)</span></div>
            <div>Provider Name: <span className="font-semibold">linkedin</span></div>
            <div>Provider ID: <span className="font-semibold">oidc.linkedin</span></div>
            <div>Client ID: <span className="font-semibold">{linkedInConfig.clientId}</span></div>
            <div>Issuer URL: <span className="font-semibold">https://www.linkedin.com/oauth</span></div>
          </div>
        </div>

        <div className="bg-purple-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Redirect URIs for LinkedIn App</h2>
          <div className="space-y-2 font-mono text-sm">
            <div>Development: <span className="font-semibold">http://localhost:3000/__/auth/handler</span></div>
            <div>Production: <span className="font-semibold">https://{firebaseConfig.projectId}.firebaseapp.com/__/auth/handler</span></div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Debug Instructions</h2>
          <p className="text-sm">
            Open browser console (F12) to see the full configuration objects logged to console.
            You can also inspect <code>window.__NEXT_DATA__</code> for Next.js runtime data.
          </p>
        </div>
      </div>
    </div>
  );
}