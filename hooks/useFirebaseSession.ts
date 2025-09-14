'use client';

import { useEffect, useState } from 'react';

export function useFirebaseSession() {
  const [hasFirebaseSession, setHasFirebaseSession] = useState(false);
  
  // Function to check session state
  const checkFirebaseSession = () => {
    try {
      // Server-side or SSR check
      if (typeof window === 'undefined') {
        return false;
      }
      
      // Check if user has a Firebase session cookie (set by our firebase-sync API)
      const hasSessionCookie = document.cookie.includes('dealmecca-session');
      
      // Also check if Firebase user is signed in by checking localStorage
      // Firebase Auth persists session data in localStorage
      const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
      if (!apiKey || apiKey === 'demo-api-key') {
        console.log('🔍 Firebase not configured, skipping auth check');
        return false;
      }
      
      const firebaseAuthKey = `firebase:authUser:${apiKey}:[DEFAULT]`;
      const hasFirebaseAuth = localStorage.getItem(firebaseAuthKey);
      
      console.log('🔍 Firebase session check:', {
        hasSessionCookie,
        hasFirebaseAuth: !!hasFirebaseAuth,
        firebaseAuthKey: firebaseAuthKey.substring(0, 50) + '...'
      });
      
      return hasSessionCookie || !!hasFirebaseAuth;
    } catch (error) {
      console.warn('Firebase session check failed:', error);
      return false;
    }
  };
  
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;
    
    // Initial check
    const checkAndUpdate = () => {
      const isFirebaseUser = checkFirebaseSession();
      
      if (isFirebaseUser && !hasFirebaseSession) {
        console.log('🔥 Firebase session detected, suppressing NextAuth.js');
        setHasFirebaseSession(true);
        
        // Global NextAuth.js suppression
        (window as any).__DISABLE_NEXTAUTH = true;
        
        // Prevent redirects to NextAuth error pages
        const originalReplace = window.location.replace;
        const originalAssign = window.location.assign;
        
        if (!(window as any).__LOCATION_OVERRIDE) {
          (window as any).__LOCATION_OVERRIDE = true;
          
          window.location.replace = function(url: string) {
            if (url.includes('/api/auth/error') || url.includes('/auth/error')) {
              console.log('🚫 Blocked NextAuth error redirect for Firebase user:', url);
              window.location.href = '/dashboard'; // Redirect to dashboard instead
              return;
            }
            return originalReplace.call(this, url);
          };
          
          window.location.assign = function(url: string) {
            if (url.includes('/api/auth/error') || url.includes('/auth/error')) {
              console.log('🚫 Blocked NextAuth error redirect for Firebase user:', url);
              window.location.href = '/dashboard'; // Redirect to dashboard instead
              return;
            }
            return originalAssign.call(this, url);
          };
        }
        
        // Intercept NextAuth.js fetch calls globally
        const originalFetch = window.fetch;
        if (!(window as any).__NEXTAUTH_FETCH_OVERRIDDEN) {
          (window as any).__NEXTAUTH_FETCH_OVERRIDDEN = true;
          window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
            const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
            if (url.includes('/api/auth/') && 
                !url.includes('/api/auth/firebase-sync') && 
                !url.includes('/api/auth/verify-session')) {
              console.log('🚫 Blocked NextAuth.js fetch call for Firebase user:', url);
              
              // Return different responses based on the endpoint
              if (url.includes('/api/auth/session')) {
                return Promise.resolve(new Response(JSON.stringify({ user: null }), { 
                  status: 200, 
                  statusText: 'OK',
                  headers: { 'Content-Type': 'application/json' }
                }));
              } else if (url.includes('/api/auth/error')) {
                // Prevent error page redirects for Firebase users
                console.log('🚫 Preventing NextAuth error redirect for Firebase user');
                return Promise.resolve(new Response(JSON.stringify({ error: 'Firebase Auth active' }), { 
                  status: 200, 
                  statusText: 'OK',
                  headers: { 'Content-Type': 'application/json' }
                }));
              } else {
                return Promise.resolve(new Response(JSON.stringify({ message: 'NextAuth disabled - using Firebase Auth' }), { 
                  status: 200, 
                  statusText: 'OK',
                  headers: { 'Content-Type': 'application/json' }
                }));
              }
            }
            return originalFetch.call(this, input, init);
          };
        }
      } else if (!isFirebaseUser && hasFirebaseSession) {
        console.log('🔥 Firebase session lost, re-enabling NextAuth.js');
        setHasFirebaseSession(false);
      }
    };
    
    // Check immediately
    checkAndUpdate();
    
    // Poll for session changes every 2 seconds for the first 30 seconds (to catch session establishment)
    // Then poll every 10 seconds for ongoing session monitoring
    let attempts = 0;
    const maxAttempts = 15; // 30 seconds at 2-second intervals
    
    pollInterval = setInterval(() => {
      attempts++;
      checkAndUpdate();
      
      // After initial period, reduce polling frequency
      if (attempts >= maxAttempts) {
        clearInterval(pollInterval);
        // Set up less frequent polling for ongoing monitoring
        pollInterval = setInterval(checkAndUpdate, 10000); // Every 10 seconds
      }
    }, 2000); // Every 2 seconds initially
    
    // Cleanup on unmount
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [hasFirebaseSession]);
  
  return hasFirebaseSession;
}