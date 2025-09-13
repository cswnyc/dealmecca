'use client';

import { useEffect } from 'react';

// Execute suppression logic immediately when module loads
if (typeof window !== 'undefined') {
  // Check for any Firebase session indicators
  const hasFirebaseSession = () => {
    // Check for dealmecca-session cookie
    if (document.cookie.includes('dealmecca-session')) {
      return true;
    }
    
    // Check for Firebase auth data in localStorage
    const firebaseKey = `firebase:authUser:${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}:[DEFAULT]`;
    if (localStorage.getItem(firebaseKey)) {
      return true;
    }
    
    return false;
  };

  if (hasFirebaseSession()) {
    console.log('🔥 Global Firebase suppression activated (immediate)');
    
    // Suppress NextAuth.js globally
    (window as any).__DISABLE_NEXTAUTH = true;
    
    // Override fetch globally for all NextAuth.js calls
    if (!(window as any).__GLOBAL_NEXTAUTH_SUPPRESSED) {
      (window as any).__GLOBAL_NEXTAUTH_SUPPRESSED = true;
      
      const originalFetch = window.fetch;
      window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
        const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
        
        if (url.includes('/api/auth/') && 
            !url.includes('/api/auth/firebase-sync') && 
            !url.includes('/api/auth/verify-session')) {
          console.log('🚫 Global NextAuth.js suppression:', url);
          
          // Return appropriate mock responses
          if (url.includes('/api/auth/session')) {
            return Promise.resolve(new Response(JSON.stringify({ user: null }), { 
              status: 200, 
              statusText: 'OK',
              headers: { 'Content-Type': 'application/json' }
            }));
          } else if (url.includes('/api/auth/me')) {
            return Promise.resolve(new Response(JSON.stringify({ user: null }), { 
              status: 200, 
              statusText: 'OK',
              headers: { 'Content-Type': 'application/json' }
            }));
          } else {
            return Promise.resolve(new Response(JSON.stringify({ message: 'Firebase Auth active' }), { 
              status: 200, 
              statusText: 'OK',
              headers: { 'Content-Type': 'application/json' }
            }));
          }
        }
        
        return originalFetch.call(this, input, init);
      };
      
      // Also suppress console errors from NextAuth.js
      const originalError = console.error;
      console.error = function(...args: any[]) {
        const message = args[0];
        if (typeof message === 'string' && 
            (message.includes('[next-auth]') || 
             message.includes('CLIENT_FETCH_ERROR') ||
             message.includes('Failed to execute') ||
             message.includes('SyntaxError'))) {
          console.log('🚫 Suppressed NextAuth.js error for Firebase user:', message);
          return;
        }
        return originalError.apply(console, args);
      };
    }
  }
}

export default function FirebaseGlobalSuppressor() {
  useEffect(() => {
    // Double-check suppression is active after component mount
    const hasFirebaseSession = () => {
      if (document.cookie.includes('dealmecca-session')) {
        return true;
      }
      
      const firebaseKey = `firebase:authUser:${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}:[DEFAULT]`;
      if (localStorage.getItem(firebaseKey)) {
        return true;
      }
      
      return false;
    };

    if (hasFirebaseSession() && !(window as any).__GLOBAL_NEXTAUTH_SUPPRESSED) {
      console.log('🔥 Applying Firebase suppression via useEffect fallback');
      
      (window as any).__DISABLE_NEXTAUTH = true;
      (window as any).__GLOBAL_NEXTAUTH_SUPPRESSED = true;
      
      const originalFetch = window.fetch;
      window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
        const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
        
        if (url.includes('/api/auth/') && 
            !url.includes('/api/auth/firebase-sync') && 
            !url.includes('/api/auth/verify-session')) {
          console.log('🚫 Global NextAuth.js suppression (fallback):', url);
          
          if (url.includes('/api/auth/session')) {
            return Promise.resolve(new Response(JSON.stringify({ user: null }), { 
              status: 200, 
              statusText: 'OK',
              headers: { 'Content-Type': 'application/json' }
            }));
          } else if (url.includes('/api/auth/me')) {
            return Promise.resolve(new Response(JSON.stringify({ user: null }), { 
              status: 200, 
              statusText: 'OK',
              headers: { 'Content-Type': 'application/json' }
            }));
          } else {
            return Promise.resolve(new Response(JSON.stringify({ message: 'Firebase Auth active' }), { 
              status: 200, 
              statusText: 'OK',
              headers: { 'Content-Type': 'application/json' }
            }));
          }
        }
        
        return originalFetch.call(this, input, init);
      };
      
      const originalError = console.error;
      console.error = function(...args: any[]) {
        const message = args[0];
        if (typeof message === 'string' && 
            (message.includes('[next-auth]') || 
             message.includes('CLIENT_FETCH_ERROR') ||
             message.includes('Failed to execute') ||
             message.includes('SyntaxError'))) {
          console.log('🚫 Suppressed NextAuth.js error for Firebase user (fallback):', message);
          return;
        }
        return originalError.apply(console, args);
      };
    }
  }, []);

  return null; // This component doesn't render anything
}