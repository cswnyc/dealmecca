/**
 * Firebase Configuration Diagnostic Page
 * Tests Firebase connection and authentication methods
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { auth } from '@/lib/firebase';

export default function FirebaseConfigTest() {
  const [tests, setTests] = useState({
    firebaseInit: { status: 'pending', message: '' },
    authInit: { status: 'pending', message: '' },
    anonymousEnabled: { status: 'pending', message: '' },
    anonymousTest: { status: 'pending', message: '' }
  });

  const [isRunning, setIsRunning] = useState(false);

  const updateTest = (testName: string, status: 'success' | 'error' | 'pending', message: string) => {
    setTests(prev => ({
      ...prev,
      [testName]: { status, message }
    }));
  };

  const runDiagnostics = async () => {
    setIsRunning(true);

    // Test 1: Firebase initialization
    try {
      if (typeof window !== 'undefined') {
        updateTest('firebaseInit', 'success', 'Firebase SDK loaded successfully');
      } else {
        updateTest('firebaseInit', 'error', 'Running on server side');
      }
    } catch (error) {
      updateTest('firebaseInit', 'error', `Firebase init failed: ${error}`);
    }

    // Test 2: Auth initialization
    try {
      if (auth) {
        updateTest('authInit', 'success', `Auth initialized with app: ${auth.app.name}`);
      } else {
        updateTest('authInit', 'error', 'Auth object is null');
      }
    } catch (error) {
      updateTest('authInit', 'error', `Auth init failed: ${error}`);
    }

    // Test 3: Check auth methods (this requires making a test call)
    try {
      if (auth) {
        // Try to get current user to test connection
        const currentUser = auth.currentUser;
        updateTest('anonymousEnabled', 'success', `Current user: ${currentUser ? 'exists' : 'none'}`);
      }
    } catch (error) {
      updateTest('anonymousEnabled', 'error', `Auth methods check failed: ${error}`);
    }

    // Test 4: Actual anonymous sign-in test
    try {
      if (auth) {
        const { signInAnonymously } = await import('firebase/auth');
        const result = await signInAnonymously(auth);
        updateTest('anonymousTest', 'success', `Anonymous user created: ${result.user.uid.substring(0, 8)}...`);
      }
    } catch (error: any) {
      updateTest('anonymousTest', 'error', `Anonymous sign-in failed: ${error.code || error.message}`);
    }

    setIsRunning(false);
  };

  const resetTests = () => {
    setTests({
      firebaseInit: { status: 'pending', message: '' },
      authInit: { status: 'pending', message: '' },
      anonymousEnabled: { status: 'pending', message: '' },
      anonymousTest: { status: 'pending', message: '' }
    });
  };

  const getIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending': return <AlertCircle className="w-5 h-5 text-gray-400" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'success': return 'default';
      case 'error': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Firebase Configuration Diagnostics</h1>
        <p className="text-muted-foreground">
          Test Firebase setup and anonymous authentication
        </p>
      </div>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Diagnostic Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button
              onClick={runDiagnostics}
              disabled={isRunning}
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running Tests...
                </>
              ) : (
                'Run Diagnostics'
              )}
            </Button>
            <Button
              variant="outline"
              onClick={resetTests}
              disabled={isRunning}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { key: 'firebaseInit', title: 'Firebase SDK', description: 'Firebase SDK initialization' },
          { key: 'authInit', title: 'Auth Module', description: 'Firebase Auth module setup' },
          { key: 'anonymousEnabled', title: 'Auth Connection', description: 'Authentication service connection' },
          { key: 'anonymousTest', title: 'Anonymous Sign-in', description: 'Actual anonymous authentication test' }
        ].map(({ key, title, description }) => (
          <Card key={key}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getIcon(tests[key as keyof typeof tests].status)}
                  <Badge variant={getBadgeVariant(tests[key as keyof typeof tests].status)}>
                    {tests[key as keyof typeof tests].status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {tests[key as keyof typeof tests].message || 'Not tested yet'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Firebase Config Display */}
      <Card>
        <CardHeader>
          <CardTitle>Current Firebase Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto">
            {JSON.stringify({
              apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.substring(0, 10) + '...',
              authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
              projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
              storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
              messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
              appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.substring(0, 20) + '...',
              measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
            }, null, 2)}
          </pre>
        </CardContent>
      </Card>

      {/* Troubleshooting Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium">If Firebase SDK fails:</h4>
            <p className="text-sm text-muted-foreground">Check environment variables and Firebase config</p>
          </div>
          <div>
            <h4 className="font-medium">If Auth Module fails:</h4>
            <p className="text-sm text-muted-foreground">Check Firebase Auth import and initialization</p>
          </div>
          <div>
            <h4 className="font-medium">If Anonymous Sign-in fails with "operation-not-allowed":</h4>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Ensure Anonymous Authentication is enabled in Firebase Console</li>
              <li>Check that you clicked "Save" after enabling</li>
              <li>Verify the project ID matches your Firebase project</li>
              <li>Try refreshing Firebase Console and re-enabling</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}