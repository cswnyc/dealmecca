/**
 * Completely Isolated Test
 * Tests basic functionality without Firebase dependencies
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { generateAnonymousProfile, generateAvatar, getAvatarDataUrl } from '@/lib/user-generator';

export default function IsolatedTestPage() {
  const [testResults, setTestResults] = useState<any[]>([]);

  const runTest = (testName: string, testFn: () => any) => {
    try {
      const result = testFn();
      setTestResults(prev => [...prev, { testName, status: 'SUCCESS', result }]);
      return result;
    } catch (error: any) {
      setTestResults(prev => [...prev, { testName, status: 'ERROR', error: error.message }]);
      return null;
    }
  };

  const runAllTests = () => {
    setTestResults([]);

    // Test 1: Username Generation
    runTest('Username Generation', () => {
      const profile = generateAnonymousProfile('test-user-123');
      return { username: profile.username, isAnonymous: profile.isAnonymous };
    });

    // Test 2: Avatar Generation
    runTest('Avatar SVG Generation', () => {
      const svg = generateAvatar('test-user-123', 40);
      return { svgLength: svg.length, hasSVGTag: svg.includes('<svg') };
    });

    // Test 3: Avatar Data URL
    runTest('Avatar Data URL', () => {
      const dataUrl = getAvatarDataUrl('test-user-123', 40);
      return { dataUrl: dataUrl.substring(0, 50) + '...', isDataUrl: dataUrl.startsWith('data:') };
    });

    // Test 4: Multiple Users
    runTest('Multiple User Generation', () => {
      const users = Array.from({ length: 5 }, (_, i) =>
        generateAnonymousProfile(`test-user-${i}`)
      );
      return users.map(u => u.username);
    });

    // Test 5: API Test (Manual)
    runTest('Manual API Test', () => {
      return {
        message: 'Manual test - check browser network tab',
        testUrl: '/api/auth/user',
        method: 'POST',
        body: {
          firebaseUid: 'test-manual-123',
          email: 'test@example.com',
          isAnonymous: true
        }
      };
    });
  };

  const testAPI = async () => {
    try {
      const response = await fetch('/api/auth/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseUid: `test-${Date.now()}`,
          email: 'test@example.com',
          isAnonymous: true
        })
      });

      const result = await response.json();
      setTestResults(prev => [...prev, {
        testName: 'Live API Test',
        status: response.ok ? 'SUCCESS' : 'ERROR',
        result: result
      }]);
    } catch (error: any) {
      setTestResults(prev => [...prev, {
        testName: 'Live API Test',
        status: 'ERROR',
        error: error.message
      }]);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Isolated System Test</h1>
        <p className="text-muted-foreground">
          Testing core functionality without Firebase dependencies
        </p>
      </div>

      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Test Controls</CardTitle>
          <CardDescription>Run isolated tests to verify functionality</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <Button onClick={runAllTests}>
              Run Core Tests
            </Button>
            <Button onClick={testAPI} variant="outline">
              Test API Endpoint
            </Button>
            <Button
              onClick={() => setTestResults([])}
              variant="destructive"
            >
              Clear Results
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sample Generated Users */}
      <Card>
        <CardHeader>
          <CardTitle>Sample Generated Users</CardTitle>
          <CardDescription>Live username and avatar generation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }, (_, i) => {
              const profile = generateAnonymousProfile(`demo-${i}`);
              const avatarDataUrl = getAvatarDataUrl(`demo-${i}`, 40);
              return (
                <div key={i} className="flex items-center gap-3 p-3 border rounded">
                  <img
                    src={avatarDataUrl}
                    alt={`Avatar for ${profile.username}`}
                    width={40}
                    height={40}
                    className="rounded-lg"
                  />
                  <div>
                    <p className="font-mono text-sm">{profile.username}</p>
                    <p className="text-xs text-muted-foreground">Anonymous</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>Results from automated tests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((test, i) => (
                <div key={i} className="p-3 border rounded">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{test.testName}</h4>
                    <span className={`px-2 py-1 rounded text-xs ${
                      test.status === 'SUCCESS'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {test.status}
                    </span>
                  </div>
                  <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                    {JSON.stringify(test.result || test.error, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Troubleshooting Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <h4 className="font-medium">✅ If Core Tests Pass:</h4>
            <p className="text-muted-foreground">Username generation and avatar creation are working correctly</p>
          </div>
          <div>
            <h4 className="font-medium">✅ If API Test Passes:</h4>
            <p className="text-muted-foreground">Database connection and user creation API is working</p>
          </div>
          <div>
            <h4 className="font-medium">❌ If API Test Fails:</h4>
            <p className="text-muted-foreground">Check server logs, database connection, or Prisma schema</p>
          </div>
          <div>
            <h4 className="font-medium">🔧 Next Steps:</h4>
            <p className="text-muted-foreground">
              If basic functionality works, the issue is with Firebase integration.
              We can build a working anonymous system without Firebase first.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}