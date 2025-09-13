'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfettiCelebration, useConfettiCelebration, CelebrationType } from '@/components/auth/ConfettiCelebration';

export default function TestConfettiPage() {
  const { initTrigger, celebrate, reset } = useConfettiCelebration();

  const celebrationTypes: { type: CelebrationType; label: string; description: string }[] = [
    {
      type: 'welcome-new-user',
      label: '🎆 New User Welcome',
      description: 'Massive explosion for first-time users'
    },
    {
      type: 'welcome-back',
      label: '✨ Welcome Back',
      description: 'Gentle sparkle for returning users'
    },
    {
      type: 'google-signin',
      label: '🔵 Google Sign-In',
      description: 'Google brand colors'
    },
    {
      type: 'linkedin-signin',
      label: '💼 LinkedIn Sign-In', 
      description: 'LinkedIn blue theme'
    },
    {
      type: 'subscription-upgrade',
      label: '🏆 Premium Upgrade',
      description: 'Golden premium effect'
    },
    {
      type: 'custom',
      label: '🌈 Custom Effect',
      description: 'Custom gradient colors'
    }
  ];

  const handleCelebration = (type: CelebrationType) => {
    console.log(`🎉 Triggering celebration: ${type}`);
    
    if (type === 'custom') {
      celebrate(type, {
        particleCount: 150,
        angle: 90,
        spread: 100,
        startVelocity: 60,
        colors: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe']
      });
    } else {
      celebrate(type);
    }
  };

  return (
    <>
      {/* Confetti Canvas */}
      <ConfettiCelebration onInit={initTrigger} />
      
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-center">
                🎉 Confetti Celebration Test
              </CardTitle>
              <p className="text-center text-gray-600">
                Test different confetti animations for authentication celebrations
              </p>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {celebrationTypes.map((celebration) => (
              <Card key={celebration.type} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{celebration.label}</CardTitle>
                  <p className="text-sm text-gray-600">{celebration.description}</p>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => handleCelebration(celebration.type)}
                    className="w-full"
                    variant={celebration.type === 'subscription-upgrade' ? 'default' : 'outline'}
                  >
                    Trigger {celebration.type === 'custom' ? 'Custom' : 'Animation'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={reset}
                variant="outline"
                className="w-full"
              >
                🧹 Reset Canvas
              </Button>
              
              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>Tip:</strong> Open browser console to see celebration logs</p>
                <p><strong>Usage:</strong> These celebrations trigger automatically during OAuth sign-in</p>
                <p><strong>Customization:</strong> Edit celebration presets in ConfettiCelebration.tsx</p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Ready to test Firebase authentication? 
              <br />
              <a 
                href="/auth/firebase-signin" 
                className="text-blue-600 hover:text-blue-700 font-medium underline ml-2"
              >
                Try Firebase Sign-In →
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}