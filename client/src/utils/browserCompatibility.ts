/**
 * Cross-browser compatibility utilities
 */

interface BrowserInfo {
  name: string;
  version: string;
  isSupported: boolean;
  features: {
    webp: boolean;
    intersectionObserver: boolean;
    customProperties: boolean;
    flexbox: boolean;
    grid: boolean;
    es6: boolean;
  };
}

class BrowserCompatibility {
  private browserInfo: BrowserInfo | null = null;

  /**
   * Detect browser information and capabilities
   */
  detectBrowser(): BrowserInfo {
    if (this.browserInfo) return this.browserInfo;

    const userAgent = navigator.userAgent;
    let name = 'Unknown';
    let version = '0';

    // Detect browser name and version
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      name = 'Chrome';
      const match = userAgent.match(/Chrome\/(\d+)/);
      version = match ? match[1] : '0';
    } else if (userAgent.includes('Firefox')) {
      name = 'Firefox';
      const match = userAgent.match(/Firefox\/(\d+)/);
      version = match ? match[1] : '0';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      name = 'Safari';
      const match = userAgent.match(/Version\/(\d+)/);
      version = match ? match[1] : '0';
    } else if (userAgent.includes('Edg')) {
      name = 'Edge';
      const match = userAgent.match(/Edg\/(\d+)/);
      version = match ? match[1] : '0';
    }

    // Feature detection
    const features = {
      webp: this.supportsWebP(),
      intersectionObserver: 'IntersectionObserver' in window,
      customProperties: this.supportsCSSCustomProperties(),
      flexbox: this.supportsFlexbox(),
      grid: this.supportsGrid(),
      es6: this.supportsES6()
    };

    // Determine if browser is supported
    const isSupported = this.isBrowserSupported(name, parseInt(version), features);

    this.browserInfo = {
      name,
      version,
      isSupported,
      features
    };

    return this.browserInfo;
  }

  /**
   * Check if WebP is supported
   */
  private supportsWebP(): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  /**
   * Check if CSS custom properties are supported
   */
  private supportsCSSCustomProperties(): boolean {
    return window.CSS && CSS.supports && CSS.supports('color', 'var(--test)');
  }

  /**
   * Check if flexbox is supported
   */
  private supportsFlexbox(): boolean {
    return window.CSS && CSS.supports && CSS.supports('display', 'flex');
  }

  /**
   * Check if CSS Grid is supported
   */
  private supportsGrid(): boolean {
    return window.CSS && CSS.supports && CSS.supports('display', 'grid');
  }

  /**
   * Check if ES6 features are supported
   */
  private supportsES6(): boolean {
    try {
      // Test arrow functions, const/let, template literals
      new Function('const test = () => `template ${1}`;');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Determine if browser version is supported
   */
  private isBrowserSupported(name: string, version: number, features: any): boolean {
    const minVersions = {
      Chrome: 70,
      Firefox: 65,
      Safari: 12,
      Edge: 79
    };

    const minVersion = minVersions[name as keyof typeof minVersions];
    if (!minVersion) return false;

    // Check version requirement
    if (version < minVersion) return false;

    // Check critical features
    return features.es6 && features.flexbox && features.customProperties;
  }

  /**
   * Get polyfills needed for current browser
   */
  getRequiredPolyfills(): string[] {
    const info = this.detectBrowser();
    const polyfills: string[] = [];

    if (!info.features.intersectionObserver) {
      polyfills.push('intersection-observer');
    }

    if (!info.features.es6) {
      polyfills.push('es6-shim');
    }

    return polyfills;
  }

  /**
   * Load polyfills dynamically
   */
  async loadPolyfills(): Promise<void> {
    const polyfills = this.getRequiredPolyfills();
    
    for (const polyfill of polyfills) {
      try {
        switch (polyfill) {
          case 'intersection-observer':
            if (!('IntersectionObserver' in window)) {
              // Load intersection observer polyfill from CDN
              const script = document.createElement('script');
              script.src = 'https://polyfill.io/v3/polyfill.min.js?features=IntersectionObserver';
              document.head.appendChild(script);
            }
            break;
          // Add more polyfills as needed
        }
      } catch (error) {
        console.warn(`Failed to load polyfill: ${polyfill}`, error);
      }
    }
  }

  /**
   * Add browser-specific CSS classes to document
   */
  addBrowserClasses(): void {
    const info = this.detectBrowser();
    const classes = [
      `browser-${info.name.toLowerCase()}`,
      `browser-version-${info.version}`,
      info.isSupported ? 'browser-supported' : 'browser-unsupported'
    ];

    // Add feature classes
    Object.entries(info.features).forEach(([feature, supported]) => {
      classes.push(supported ? `supports-${feature}` : `no-${feature}`);
    });

    document.documentElement.classList.add(...classes);
  }

  /**
   * Show browser compatibility warning if needed
   */
  showCompatibilityWarning(): void {
    const info = this.detectBrowser();
    
    if (!info.isSupported) {
      const warning = document.createElement('div');
      warning.className = 'browser-warning';
      warning.innerHTML = `
        <div style="
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: #ff6b35;
          color: white;
          padding: 12px;
          text-align: center;
          z-index: 10000;
          font-family: sans-serif;
        ">
          <strong>🎃 Spooky Warning!</strong> 
          Your browser (${info.name} ${info.version}) may not support all features. 
          Please update to the latest version for the best spooky experience!
          <button 
            onclick="this.parentElement.parentElement.remove()" 
            style="
              background: none;
              border: 1px solid white;
              color: white;
              margin-left: 10px;
              padding: 4px 8px;
              cursor: pointer;
              border-radius: 4px;
            "
          >
            Dismiss
          </button>
        </div>
      `;
      
      document.body.appendChild(warning);
      
      // Auto-remove after 10 seconds
      setTimeout(() => {
        if (warning.parentElement) {
          warning.remove();
        }
      }, 10000);
    }
  }

  /**
   * Get browser-specific CSS prefixes
   */
  getCSSPrefixes(): string[] {
    const info = this.detectBrowser();
    
    switch (info.name) {
      case 'Chrome':
      case 'Edge':
        return ['-webkit-'];
      case 'Firefox':
        return ['-moz-'];
      case 'Safari':
        return ['-webkit-'];
      default:
        return [];
    }
  }

  /**
   * Apply CSS with vendor prefixes
   */
  applyPrefixedCSS(element: HTMLElement, property: string, value: string): void {
    const prefixes = this.getCSSPrefixes();
    
    // Apply unprefixed version
    element.style.setProperty(property, value);
    
    // Apply prefixed versions
    prefixes.forEach(prefix => {
      element.style.setProperty(`${prefix}${property}`, value);
    });
  }
}

// Export singleton instance
export const browserCompatibility = new BrowserCompatibility();

// Auto-initialize on load
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    browserCompatibility.addBrowserClasses();
    browserCompatibility.loadPolyfills();
    
    // Show warning in development or for unsupported browsers
    if ((import.meta as any).env?.DEV || !browserCompatibility.detectBrowser().isSupported) {
      browserCompatibility.showCompatibilityWarning();
    }
  });
}