'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ManualLoginPage() {
  const [email, setEmail] = useState('pro@dealmecca.pro');
  const [password, setPassword] = useState('test123');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/manual-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Login successful! Redirecting to admin...');
        // Redirect to admin after successful login
        setTimeout(() => {
          window.location.href = '/admin';
        }, 1000);
      } else {
        setMessage(`❌ ${data.error || 'Login failed'}`);
      }
    } catch (error) {
      setMessage('❌ Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Manual Login</CardTitle>
          <p className="text-center text-gray-600">Bypass cookie issues</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pro@dealmecca.pro"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="test123"
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
            
            {message && (
              <div className={`text-sm p-3 rounded ${
                message.includes('✅') 
                  ? 'bg-green-50 text-green-700' 
                  : 'bg-red-50 text-red-700'
              }`}>
                {message}
              </div>
            )}
          </form>
          
          <div className="mt-6 p-4 bg-blue-50 rounded text-sm">
            <h3 className="font-medium text-blue-900 mb-2">Test Credentials:</h3>
            <div className="text-blue-700">
              <div><strong>Email:</strong> pro@dealmecca.pro</div>
              <div><strong>Password:</strong> test123</div>
              <div><strong>Role:</strong> PRO (has admin access)</div>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <a href="/auth/signin" className="text-blue-600 hover:underline text-sm">
              ← Back to regular login
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}