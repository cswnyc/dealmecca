'use client';

import { useCallback, useEffect, useRef } from 'react';
import ReactCanvasConfetti from 'react-canvas-confetti';

export type CelebrationTrigger = {
  fire: (options?: ConfettiOptions) => void;
  reset: () => void;
};

export type CelebrationType = 
  | 'welcome-new-user'     // Massive explosion for first-time users
  | 'welcome-back'         // Gentle sparkle for returning users  
  | 'google-signin'        // Google brand colors
  | 'linkedin-signin'      // LinkedIn blue theme
  | 'subscription-upgrade' // Special gold/premium effect
  | 'custom';              // Custom configuration

export interface ConfettiOptions {
  particleCount?: number;
  angle?: number;
  spread?: number;
  startVelocity?: number;
  decay?: number;
  gravity?: number;
  drift?: number;
  colors?: string[];
  shapes?: string[];
  scalar?: number;
  zIndex?: number;
  disableForReducedMotion?: boolean;
}

interface ConfettiCelebrationProps {
  onInit?: (trigger: CelebrationTrigger) => void;
  className?: string;
}

// Predefined celebration configurations
const celebrationPresets: Record<CelebrationType, ConfettiOptions[]> = {
  'welcome-new-user': [
    // Big central explosion
    {
      particleCount: 150,
      angle: 90,
      spread: 120,
      startVelocity: 70,
      decay: 0.9,
      gravity: 1,
      colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'],
      scalar: 1.2,
      zIndex: 100
    },
    // Left side burst
    {
      particleCount: 100,
      angle: 45,
      spread: 80,
      startVelocity: 60,
      decay: 0.85,
      gravity: 1,
      colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffd93d'],
      scalar: 1.1
    },
    // Right side burst  
    {
      particleCount: 100,
      angle: 135,
      spread: 80,
      startVelocity: 60,
      decay: 0.85,
      gravity: 1,
      colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffd93d'],
      scalar: 1.1
    }
  ],
  'welcome-back': [
    {
      particleCount: 50,
      angle: 90,
      spread: 50,
      startVelocity: 35,
      decay: 0.92,
      gravity: 0.8,
      colors: ['#4285f4', '#34a853', '#ea4335', '#fbbc05'],
      scalar: 0.8
    }
  ],
  'google-signin': [
    {
      particleCount: 80,
      angle: 90,
      spread: 60,
      startVelocity: 45,
      decay: 0.9,
      gravity: 1,
      colors: ['#4285f4', '#34a853', '#ea4335', '#fbbc05'], // Google brand colors
      scalar: 1.0
    }
  ],
  'linkedin-signin': [
    {
      particleCount: 70,
      angle: 90,
      spread: 55,
      startVelocity: 40,
      decay: 0.88,
      gravity: 1,
      colors: ['#0077b5', '#ffffff', '#0e76a8', '#40e0d0'], // LinkedIn blue theme
      scalar: 0.9
    }
  ],
  'subscription-upgrade': [
    // Golden shower effect
    {
      particleCount: 120,
      angle: 90,
      spread: 100,
      startVelocity: 55,
      decay: 0.8,
      gravity: 1.2,
      colors: ['#ffd700', '#ffed4a', '#f6ad55', '#ed8936'], // Gold premium colors
      scalar: 1.3
    },
    // Sparkle effect
    {
      particleCount: 60,
      angle: 45,
      spread: 30,
      startVelocity: 25,
      decay: 0.95,
      gravity: 0.5,
      colors: ['#ffffff', '#f7fafc', '#edf2f7'],
      scalar: 0.6
    }
  ],
  'custom': [
    {
      particleCount: 100,
      angle: 90,
      spread: 70,
      startVelocity: 50,
      decay: 0.9,
      gravity: 1,
      colors: ['#667eea', '#764ba2', '#f093fb', '#f5576c'],
      scalar: 1.0
    }
  ]
};

export function ConfettiCelebration({ onInit, className }: ConfettiCelebrationProps) {
  const refAnimationInstance = useRef<any>(null);

  const getInstance = useCallback((instance: any) => {
    refAnimationInstance.current = instance;
  }, []);

  const fire = useCallback((options: ConfettiOptions = {}) => {
    if (refAnimationInstance.current) {
      refAnimationInstance.current({
        particleCount: 100,
        angle: 90,
        spread: 70,
        startVelocity: 50,
        decay: 0.9,
        gravity: 1,
        ...options
      });
    }
  }, []);

  const reset = useCallback(() => {
    if (refAnimationInstance.current) {
      refAnimationInstance.current.reset();
    }
  }, []);

  // Initialize the trigger functions
  useEffect(() => {
    if (onInit) {
      onInit({ fire, reset });
    }
  }, [onInit, fire, reset]);

  return (
    <ReactCanvasConfetti
      refConfetti={getInstance}
      className={className}
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        zIndex: 1000
      }}
    />
  );
}

// Hook for using confetti celebrations
export function useConfettiCelebration() {
  const triggerRef = useRef<CelebrationTrigger | null>(null);

  const initTrigger = useCallback((trigger: CelebrationTrigger) => {
    triggerRef.current = trigger;
  }, []);

  const celebrate = useCallback((type: CelebrationType, customOptions?: ConfettiOptions) => {
    if (!triggerRef.current) return;

    if (type === 'custom' && customOptions) {
      triggerRef.current.fire(customOptions);
      return;
    }

    const presets = celebrationPresets[type];
    if (!presets || presets.length === 0) return;

    // Fire all preset configurations with timing delays
    presets.forEach((preset, index) => {
      setTimeout(() => {
        triggerRef.current?.fire(preset);
      }, index * 200); // Stagger multiple bursts
    });
  }, []);

  const reset = useCallback(() => {
    triggerRef.current?.reset();
  }, []);

  return {
    initTrigger,
    celebrate,
    reset
  };
}

// Utility function to determine celebration type based on user context
export function getCelebrationTypeForUser(
  isNewUser: boolean,
  provider: 'google' | 'linkedin' | 'credentials',
  isUpgrade?: boolean
): CelebrationType {
  if (isUpgrade) {
    return 'subscription-upgrade';
  }
  
  if (isNewUser) {
    return 'welcome-new-user';
  }
  
  if (provider === 'google') {
    return 'google-signin';
  }
  
  if (provider === 'linkedin') {
    return 'linkedin-signin';
  }
  
  return 'welcome-back';
}