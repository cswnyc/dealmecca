'use client';

import React from 'react';

import MobileBottomNav from '@/components/mobile/MobileBottomNav';

/**
 * Dev-only preview page to visually QA the mobile bottom navigation without auth.
 * This route is intended for local development and should not be linked from the app.
 */
export default function DevBottomNavPage(): JSX.Element {
  if (process.env.NODE_ENV === 'production') {
    return (
      <main className="min-h-screen bg-background p-6">
        <p className="text-sm text-muted-foreground">Not found.</p>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-md px-4 pt-6">
        <h1 className="text-lg font-semibold text-foreground">Bottom Nav Preview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This page exists to visually check alignment for icons/labels/badges in the mobile bottom nav.
        </p>

        <div className="mt-6 space-y-3">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="text-sm font-medium text-foreground">Badge state</div>
            <div className="mt-1 text-sm text-muted-foreground">
              The real app passes notification counts; here we force a non-zero badge for QA.
            </div>
          </div>
          <div className="h-[60vh] rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
            Content placeholder (scroll / layout context)
          </div>
        </div>
      </main>

      {/* Force a visible badge for QA */}
      <MobileBottomNav notifications={12} />
    </div>
  );
}

