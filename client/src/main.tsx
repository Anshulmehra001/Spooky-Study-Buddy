import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { performanceMonitor } from './utils/performanceMonitor'
import { browserCompatibility } from './utils/browserCompatibility'

// Start performance monitoring
performanceMonitor.recordMetric('app-start', performance.now());

// Initialize browser compatibility
browserCompatibility.addBrowserClasses();
browserCompatibility.loadPolyfills();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)