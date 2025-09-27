'use client';

import { useState } from 'react';

export default function TestConvertKit() {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [testType, setTestType] = useState<'subscribe' | 'unsubscribe' | 'status'>('subscribe');

  const handleTest = async () => {
    if (!email) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let response;

      if (testType === 'subscribe') {
        response = await fetch('/api/newsletter/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            firstName: firstName || undefined,
            source: 'test-page'
          })
        });
      } else if (testType === 'unsubscribe') {
        response = await fetch('/api/newsletter/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
      } else {
        // Test ConvertKit status endpoint
        response = await fetch('/api/convertkit/status', {
          method: 'GET'
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Test failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">ConvertKit Integration Test</h1>

        {/* Configuration Status */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Configuration Status</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>API Key:</span>
              <span className={process.env.NEXT_PUBLIC_CONVERTKIT_API_KEY ? "text-green-600" : "text-red-600"}>
                {process.env.NEXT_PUBLIC_CONVERTKIT_API_KEY ? "✅ Configured" : "❌ Missing"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>API Secret:</span>
              <span className="text-yellow-600">🔒 Server-side only</span>
            </div>
          </div>

          {!process.env.NEXT_PUBLIC_CONVERTKIT_API_KEY && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-800 text-sm">
                <strong>Setup Required:</strong> Add your ConvertKit API credentials to .env.local:
              </p>
              <pre className="mt-2 text-xs bg-yellow-100 p-2 rounded">
{`CONVERTKIT_API_KEY=your-actual-api-key
CONVERTKIT_API_SECRET=your-actual-api-secret
CONVERTKIT_FORM_ID=your-form-id (optional)`}
              </pre>
            </div>
          )}
        </div>

        {/* Test Controls */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Test ConvertKit Integration</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Test Type</label>
              <select
                value={testType}
                onChange={(e) => setTestType(e.target.value as any)}
                className="w-full p-2 border rounded"
              >
                <option value="subscribe">Subscribe to Newsletter</option>
                <option value="unsubscribe">Unsubscribe from Newsletter</option>
                <option value="status">Check ConvertKit Status</option>
              </select>
            </div>

            {testType !== 'status' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="test@example.com"
                    className="w-full p-2 border rounded"
                  />
                </div>

                {testType === 'subscribe' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name (Optional)</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                )}
              </>
            )}

            <button
              onClick={handleTest}
              disabled={loading || (testType !== 'status' && !email)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Testing...' : `Test ${testType === 'subscribe' ? 'Subscribe' : testType === 'unsubscribe' ? 'Unsubscribe' : 'Status'}`}
            </button>
          </div>
        </div>

        {/* Results */}
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
            <h3 className="text-red-800 font-semibold mb-2">❌ Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
            <h3 className="text-green-800 font-semibold mb-2">✅ Success</h3>
            <pre className="text-sm bg-green-100 p-3 rounded overflow-x-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        {/* Integration Info */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">ConvertKit Integration Features</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-start">
              <span className="text-green-600 mr-2">✅</span>
              <span>Newsletter subscription with tier tagging</span>
            </div>
            <div className="flex items-start">
              <span className="text-green-600 mr-2">✅</span>
              <span>Automatic tier updates via Stripe webhooks</span>
            </div>
            <div className="flex items-start">
              <span className="text-green-600 mr-2">✅</span>
              <span>Unsubscribe handling with email and web interface</span>
            </div>
            <div className="flex items-start">
              <span className="text-green-600 mr-2">✅</span>
              <span>Custom field tracking (user tier, signup source)</span>
            </div>
            <div className="flex items-start">
              <span className="text-green-600 mr-2">✅</span>
              <span>Tag management for segmentation</span>
            </div>
            <div className="flex items-start">
              <span className="text-yellow-600 mr-2">⚙️</span>
              <span>Sequence enrollment (ready for configuration)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}