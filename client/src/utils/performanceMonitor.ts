/**
 * Performance monitoring utilities
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  /**
   * Initialize performance observers
   */
  private initializeObservers(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    try {
      // Observe navigation timing
      const navObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.recordMetric('dom-content-loaded', navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart);
            this.recordMetric('load-complete', navEntry.loadEventEnd - navEntry.loadEventStart);
            this.recordMetric('first-byte', navEntry.responseStart - navEntry.requestStart);
          }
        });
      });
      navObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navObserver);

      // Observe paint timing
      const paintObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.recordMetric(entry.name, entry.startTime);
        });
      });
      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(paintObserver);

      // Observe largest contentful paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          this.recordMetric('largest-contentful-paint', lastEntry.startTime);
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);

      // Observe layout shifts
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        if (clsValue > 0) {
          this.recordMetric('cumulative-layout-shift', clsValue);
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);

    } catch (error) {
      console.warn('Performance monitoring setup failed:', error);
    }
  }

  /**
   * Record a custom performance metric
   */
  recordMetric(name: string, value: number): void {
    this.metrics.push({
      name,
      value,
      timestamp: Date.now()
    });

    // Keep only last 100 metrics to prevent memory leaks
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  /**
   * Measure function execution time
   */
  measureFunction<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    this.recordMetric(`function-${name}`, end - start);
    return result;
  }

  /**
   * Measure async function execution time
   */
  async measureAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    this.recordMetric(`async-function-${name}`, end - start);
    return result;
  }

  /**
   * Get performance metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get metrics by name
   */
  getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(metric => metric.name === name);
  }

  /**
   * Get average value for a metric
   */
  getAverageMetric(name: string): number {
    const metrics = this.getMetricsByName(name);
    if (metrics.length === 0) return 0;
    
    const sum = metrics.reduce((acc, metric) => acc + metric.value, 0);
    return sum / metrics.length;
  }

  /**
   * Get performance summary
   */
  getSummary(): Record<string, number> {
    const summary: Record<string, number> = {};
    const uniqueNames = [...new Set(this.metrics.map(m => m.name))];
    
    uniqueNames.forEach(name => {
      summary[name] = this.getAverageMetric(name);
    });

    return summary;
  }

  /**
   * Log performance summary to console
   */
  logSummary(): void {
    const summary = this.getSummary();
    console.group('🎃 Spooky Performance Summary');
    Object.entries(summary).forEach(([name, value]) => {
      const formattedValue = value < 1000 ? `${value.toFixed(2)}ms` : `${(value / 1000).toFixed(2)}s`;
      console.log(`${name}: ${formattedValue}`);
    });
    console.groupEnd();
  }

  /**
   * Check if performance is good
   */
  isPerformanceGood(): boolean {
    const lcp = this.getAverageMetric('largest-contentful-paint');
    const cls = this.getAverageMetric('cumulative-layout-shift');
    const fcp = this.getAverageMetric('first-contentful-paint');

    return lcp < 2500 && cls < 0.1 && fcp < 1800;
  }

  /**
   * Cleanup observers
   */
  disconnect(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics = [];
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Auto-log summary in development
if ((import.meta as any).env?.DEV) {
  setTimeout(() => {
    performanceMonitor.logSummary();
  }, 5000);
}

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    performanceMonitor.disconnect();
  });
}