/**
 * Image optimization utilities for better performance
 */

interface ImageOptimizationOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

/**
 * Lazy load images with intersection observer
 */
export class LazyImageLoader {
  private observer: IntersectionObserver | null = null;
  private images = new Set<HTMLImageElement>();

  constructor() {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              this.loadImage(img);
              this.observer?.unobserve(img);
              this.images.delete(img);
            }
          });
        },
        {
          rootMargin: '50px 0px', // Start loading 50px before image enters viewport
          threshold: 0.01
        }
      );
    }
  }

  /**
   * Add image to lazy loading queue
   */
  observe(img: HTMLImageElement): void {
    if (this.observer && img.dataset.src) {
      this.images.add(img);
      this.observer.observe(img);
    } else {
      // Fallback for browsers without IntersectionObserver
      this.loadImage(img);
    }
  }

  /**
   * Load image and handle loading states
   */
  private loadImage(img: HTMLImageElement): void {
    const src = img.dataset.src;
    if (!src) return;

    // Add loading class
    img.classList.add('loading');

    const tempImg = new Image();
    tempImg.onload = () => {
      img.src = src;
      img.classList.remove('loading');
      img.classList.add('loaded');
    };
    tempImg.onerror = () => {
      img.classList.remove('loading');
      img.classList.add('error');
    };
    tempImg.src = src;
  }

  /**
   * Cleanup observer
   */
  disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.images.clear();
    }
  }
}

/**
 * Create optimized image URL with parameters
 */
export function createOptimizedImageUrl(
  src: string,
  options: ImageOptimizationOptions = {}
): string {
  const { quality = 80, maxWidth, maxHeight, format } = options;
  
  // If it's a data URL or external URL, return as-is
  if (src.startsWith('data:') || src.startsWith('http')) {
    return src;
  }

  const params = new URLSearchParams();
  
  if (quality !== 80) params.set('q', quality.toString());
  if (maxWidth) params.set('w', maxWidth.toString());
  if (maxHeight) params.set('h', maxHeight.toString());
  if (format) params.set('f', format);

  const queryString = params.toString();
  return queryString ? `${src}?${queryString}` : src;
}

/**
 * Preload critical images
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Create responsive image srcset
 */
export function createResponsiveSrcSet(
  baseSrc: string,
  sizes: number[] = [320, 640, 1024, 1280]
): string {
  return sizes
    .map(size => `${createOptimizedImageUrl(baseSrc, { maxWidth: size })} ${size}w`)
    .join(', ');
}

/**
 * Get optimal image format based on browser support
 */
export function getOptimalImageFormat(): 'webp' | 'jpeg' {
  if (typeof window === 'undefined') return 'jpeg';
  
  // Check WebP support
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0 ? 'webp' : 'jpeg';
}

// Export singleton lazy loader
export const lazyImageLoader = new LazyImageLoader();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    lazyImageLoader.disconnect();
  });
}