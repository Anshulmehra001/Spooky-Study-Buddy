/**
 * Accessibility utilities and helpers
 */

/**
 * Focus management utilities
 */
export class FocusManager {
  private focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(', ');

  /**
   * Get all focusable elements within a container
   */
  getFocusableElements(container: HTMLElement): HTMLElement[] {
    return Array.from(container.querySelectorAll(this.focusableSelectors));
  }

  /**
   * Trap focus within a container (for modals, etc.)
   */
  trapFocus(container: HTMLElement): () => void {
    const focusableElements = this.getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    
    // Focus first element
    firstElement?.focus();

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }

  /**
   * Restore focus to previously focused element
   */
  restoreFocus(element: HTMLElement | null): void {
    if (element && typeof element.focus === 'function') {
      element.focus();
    }
  }

  /**
   * Create a focus guard for screen readers
   */
  createFocusGuard(): HTMLElement {
    const guard = document.createElement('div');
    guard.setAttribute('tabindex', '0');
    guard.setAttribute('aria-hidden', 'true');
    guard.style.position = 'fixed';
    guard.style.top = '0';
    guard.style.left = '0';
    guard.style.width = '1px';
    guard.style.height = '1px';
    guard.style.opacity = '0';
    guard.style.pointerEvents = 'none';
    return guard;
  }
}

/**
 * Screen reader utilities
 */
export class ScreenReaderUtils {
  private liveRegion: HTMLElement | null = null;

  constructor() {
    this.createLiveRegion();
  }

  /**
   * Create ARIA live region for announcements
   */
  private createLiveRegion(): void {
    if (typeof document === 'undefined') return;

    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.setAttribute('aria-relevant', 'text');
    this.liveRegion.style.position = 'absolute';
    this.liveRegion.style.left = '-10000px';
    this.liveRegion.style.width = '1px';
    this.liveRegion.style.height = '1px';
    this.liveRegion.style.overflow = 'hidden';
    
    document.body.appendChild(this.liveRegion);
  }

  /**
   * Announce message to screen readers
   */
  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (!this.liveRegion) return;

    this.liveRegion.setAttribute('aria-live', priority);
    this.liveRegion.textContent = message;

    // Clear after announcement
    setTimeout(() => {
      if (this.liveRegion) {
        this.liveRegion.textContent = '';
      }
    }, 1000);
  }

  /**
   * Announce spooky message with character context
   */
  announceSpooky(message: string, character?: string): void {
    const spookyMessage = character 
      ? `${character} says: ${message}`
      : `Spooky announcement: ${message}`;
    
    this.announce(spookyMessage, 'polite');
  }
}

/**
 * Keyboard navigation utilities
 */
export class KeyboardNavigation {
  /**
   * Handle arrow key navigation for lists
   */
  handleArrowNavigation(
    event: KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    onIndexChange: (index: number) => void
  ): void {
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        newIndex = (currentIndex + 1) % items.length;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        newIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = items.length - 1;
        break;
      default:
        return;
    }

    onIndexChange(newIndex);
    items[newIndex]?.focus();
  }

  /**
   * Handle Enter and Space key activation
   */
  handleActivation(event: KeyboardEvent, callback: () => void): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      callback();
    }
  }

  /**
   * Handle Escape key
   */
  handleEscape(event: KeyboardEvent, callback: () => void): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      callback();
    }
  }
}

/**
 * High contrast mode detection
 */
export class HighContrastDetector {
  private mediaQuery: MediaQueryList | null = null;
  private callbacks: ((isHighContrast: boolean) => void)[] = [];

  constructor() {
    this.initializeDetection();
  }

  private initializeDetection(): void {
    if (typeof window === 'undefined') return;

    // Check for Windows high contrast mode
    this.mediaQuery = window.matchMedia('(prefers-contrast: high)');
    this.mediaQuery.addEventListener('change', this.handleChange.bind(this));
  }

  private handleChange(event: MediaQueryListEvent): void {
    this.callbacks.forEach(callback => callback(event.matches));
  }

  /**
   * Check if high contrast mode is active
   */
  isHighContrast(): boolean {
    return this.mediaQuery?.matches || false;
  }

  /**
   * Subscribe to high contrast mode changes
   */
  subscribe(callback: (isHighContrast: boolean) => void): () => void {
    this.callbacks.push(callback);
    
    // Call immediately with current state
    callback(this.isHighContrast());

    // Return unsubscribe function
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }
}

/**
 * Color contrast utilities
 */
export class ColorContrastUtils {
  /**
   * Calculate relative luminance of a color
   */
  private getLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  /**
   * Calculate contrast ratio between two colors
   */
  getContrastRatio(color1: string, color2: string): number {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return 1;

    const lum1 = this.getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = this.getLuminance(rgb2.r, rgb2.g, rgb2.b);
    
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  }

  /**
   * Convert hex color to RGB
   */
  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  /**
   * Check if contrast ratio meets WCAG standards
   */
  meetsWCAG(color1: string, color2: string, level: 'AA' | 'AAA' = 'AA'): boolean {
    const ratio = this.getContrastRatio(color1, color2);
    return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
  }
}

// Export singleton instances
export const focusManager = new FocusManager();
export const screenReader = new ScreenReaderUtils();
export const keyboardNav = new KeyboardNavigation();
export const highContrastDetector = new HighContrastDetector();
export const colorContrast = new ColorContrastUtils();