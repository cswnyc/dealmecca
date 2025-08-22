'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DebugPage() {
  const handleClick = () => {
    console.log('Button clicked!');
    alert('Button works!');
  };

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>Debug Test Page</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">If you can see this and the button works, basic components are fine.</p>
          <Button onClick={handleClick}>
            Test Button
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
