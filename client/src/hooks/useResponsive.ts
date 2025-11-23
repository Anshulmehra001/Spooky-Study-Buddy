/**
 * Responsive design hooks for mobile optimization
 */

import { useState, useEffect } from 'react';

interface BreakpointConfig {
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

const defaultBreakpoints: BreakpointConfig = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280
};

/**
 * Hook to detect current screen size and breakpoint
 */
export function useBreakpoint(breakpoints: BreakpointConfig = defaultBreakpoints) {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<keyof BreakpointConfig>('lg');
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateBreakpoint = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setWindowSize({ width, height });

      if (width < breakpoints.sm) {
        setCurrentBreakpoint('sm');
      } else if (width < breakpoints.md) {
        setCurrentBreakpoint('md');
      } else if (width < breakpoints.lg) {
        setCurrentBreakpoint('lg');
      } else {
        setCurrentBreakpoint('xl');
      }
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);

    return () => window.removeEventListener('resize', updateBreakpoint);
  }, [breakpoints]);

  return {
    currentBreakpoint,
    windowSize,
    isMobile: currentBreakpoint === 'sm',
    isTablet: currentBreakpoint === 'md',
    isDesktop: currentBreakpoint === 'lg' || currentBreakpoint === 'xl',
    isSmallScreen: currentBreakpoint === 'sm' || currentBreakpoint === 'md'
  };
}

/**
 * Hook to detect if device supports touch
 */
export function useTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkTouch = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        (navigator as any).msMaxTouchPoints > 0
      );
    };

    checkTouch();
  }, []);

  return isTouchDevice;
}

/**
 * Hook to detect device orientation
 */
export function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    updateOrientation();
    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', updateOrientation);

    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
    };
  }, []);

  return orientation;
}

/**
 * Hook to detect if user prefers reduced motion
 */
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook to get optimal image sizes for responsive images
 */
export function useResponsiveImageSizes() {
  const { windowSize, currentBreakpoint } = useBreakpoint();

  const getOptimalSize = (baseWidth: number) => {
    const devicePixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    
    let targetWidth = baseWidth;
    
    switch (currentBreakpoint) {
      case 'sm':
        targetWidth = Math.min(baseWidth, windowSize.width * 0.9);
        break;
      case 'md':
        targetWidth = Math.min(baseWidth, windowSize.width * 0.8);
        break;
      case 'lg':
        targetWidth = Math.min(baseWidth, windowSize.width * 0.7);
        break;
      case 'xl':
        targetWidth = baseWidth;
        break;
    }

    return Math.round(targetWidth * devicePixelRatio);
  };

  const getSrcSet = (baseSrc: string, sizes: number[] = [320, 640, 1024, 1280]) => {
    return sizes
      .map(size => `${baseSrc}?w=${size} ${size}w`)
      .join(', ');
  };

  const getSizes = (maxWidth: number = 1200) => {
    return `(max-width: 640px) 90vw, (max-width: 768px) 80vw, (max-width: 1024px) 70vw, ${maxWidth}px`;
  };

  return {
    getOptimalSize,
    getSrcSet,
    getSizes,
    devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
  };
}

/**
 * Hook for mobile-specific interactions
 */
export function useMobileInteractions() {
  const isTouchDevice = useTouchDevice();
  const { isMobile } = useBreakpoint();

  const getTouchProps = (onClick?: () => void) => {
    if (!isTouchDevice) return { onClick };

    return {
      onClick,
      onTouchStart: (e: React.TouchEvent) => {
        // Add touch feedback
        const target = e.currentTarget as HTMLElement;
        target.style.transform = 'scale(0.98)';
      },
      onTouchEnd: (e: React.TouchEvent) => {
        // Remove touch feedback
        const target = e.currentTarget as HTMLElement;
        target.style.transform = '';
      }
    };
  };

  const getSwipeProps = (
    onSwipeLeft?: () => void,
    onSwipeRight?: () => void,
    threshold: number = 50
  ) => {
    if (!isTouchDevice) return {};

    let startX = 0;
    let startY = 0;

    return {
      onTouchStart: (e: React.TouchEvent) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      },
      onTouchEnd: (e: React.TouchEvent) => {
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        
        // Only trigger swipe if horizontal movement is greater than vertical
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
          if (deltaX > 0 && onSwipeRight) {
            onSwipeRight();
          } else if (deltaX < 0 && onSwipeLeft) {
            onSwipeLeft();
          }
        }
      }
    };
  };

  return {
    isTouchDevice,
    isMobile,
    getTouchProps,
    getSwipeProps
  };
}

/**
 * Hook to handle safe area insets for mobile devices
 */
export function useSafeArea() {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateSafeArea = () => {
      const computedStyle = getComputedStyle(document.documentElement);
      
      setSafeArea({
        top: parseInt(computedStyle.getPropertyValue('--safe-area-inset-top') || '0'),
        right: parseInt(computedStyle.getPropertyValue('--safe-area-inset-right') || '0'),
        bottom: parseInt(computedStyle.getPropertyValue('--safe-area-inset-bottom') || '0'),
        left: parseInt(computedStyle.getPropertyValue('--safe-area-inset-left') || '0')
      });
    };

    updateSafeArea();
    window.addEventListener('resize', updateSafeArea);
    window.addEventListener('orientationchange', updateSafeArea);

    return () => {
      window.removeEventListener('resize', updateSafeArea);
      window.removeEventListener('orientationchange', updateSafeArea);
    };
  }, []);

  return safeArea;
}