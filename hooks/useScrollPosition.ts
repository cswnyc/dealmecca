'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseScrollPositionReturn {
  scrollY: number;
  scrollX: number;
  showCompactHeader: boolean;
  scrollProgress: number;
  isScrolled: boolean;
  scrollToTop: () => void;
}

export function useScrollPosition(threshold: number = 300): UseScrollPositionReturn {
  const [scrollY, setScrollY] = useState(0);
  const [scrollX, setScrollX] = useState(0);
  const [showCompactHeader, setShowCompactHeader] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollElement, setScrollElement] = useState<Element | Window | null>(null);

  useEffect(() => {
    // Find the scrollable element - check for main with overflow-y-auto first
    const mainElement = document.querySelector('main.overflow-y-auto');
    const element = mainElement || window;
    setScrollElement(element);

    const handleScroll = () => {
      let currentScrollY: number;
      let scrollHeight: number;
      let clientHeight: number;

      if (mainElement) {
        currentScrollY = mainElement.scrollTop;
        scrollHeight = mainElement.scrollHeight;
        clientHeight = mainElement.clientHeight;
      } else {
        currentScrollY = window.scrollY;
        scrollHeight = document.documentElement.scrollHeight;
        clientHeight = window.innerHeight;
      }

      const documentHeight = scrollHeight - clientHeight;

      setScrollY(currentScrollY);
      setScrollX(mainElement ? mainElement.scrollLeft : window.scrollX);
      setShowCompactHeader(currentScrollY > threshold);
      setScrollProgress(documentHeight > 0 ? (currentScrollY / documentHeight) * 100 : 0);
    };

    // Initial call
    handleScroll();

    // Add listener to the correct element
    const target = mainElement || window;
    target.addEventListener('scroll', handleScroll, { passive: true });
    return () => target.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  const scrollToTop = useCallback(() => {
    if (scrollElement && scrollElement !== window) {
      (scrollElement as Element).scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [scrollElement]);

  return {
    scrollY,
    scrollX,
    showCompactHeader,
    scrollProgress,
    isScrolled: scrollY > threshold,
    scrollToTop,
  };
}
