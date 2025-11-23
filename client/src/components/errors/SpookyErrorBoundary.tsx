import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Ghost } from '../characters/Ghost';
import { Witch } from '../characters/Witch';
import { Card } from '../ui/Card';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class SpookyErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    console.error('Spooky Error Boundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-spooky-navy flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="max-w-2xl mx-auto text-center border-red-500 border-opacity-50">
              <motion.div
                animate={{ 
                  rotate: [0, -5, 5, -5, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: 'reverse'
                }}
                className="text-8xl mb-6"
              >
                💀
              </motion.div>
              
              <h1 className="text-3xl font-creepster text-red-400 mb-4">
                Oops! Something Went Terribly Wrong!
              </h1>
              
              <p className="text-spooky-cream opacity-90 mb-6 text-lg">
                The spirits have encountered an unexpected disturbance in the digital realm. 
                Don't worry, our spooky characters are here to help!
              </p>

              <div className="flex justify-center space-x-8 mb-8">
                <Ghost message="Let me try to fix this!" />
                <Witch message="I'll brew a solution!" />
              </div>

              <div className="bg-spooky-navy bg-opacity-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="text-spooky-orange font-bold mb-2">🔍 What happened?</h3>
                <p className="text-spooky-cream opacity-80 text-sm mb-2">
                  {this.state.error?.message || 'An unknown error occurred'}
                </p>
                {process.env.NODE_ENV === 'development' && (
                  <details className="text-xs text-gray-400 mt-2">
                    <summary className="cursor-pointer hover:text-spooky-orange">
                      Technical Details (Development Mode)
                    </summary>
                    <pre className="mt-2 whitespace-pre-wrap">
                      {this.state.error?.stack}
                    </pre>
                  </details>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.button
                    onClick={this.handleRetry}
                    className="bg-spooky-orange hover:bg-spooky-light-orange text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🎃 Try Again
                  </motion.button>
                  
                  <motion.button
                    onClick={this.handleReload}
                    className="bg-spooky-purple hover:bg-spooky-dark-purple text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🔄 Reload Page
                  </motion.button>
                </div>

                <motion.button
                  onClick={() => window.location.href = '/'}
                  className="text-spooky-cream hover:text-spooky-orange transition-colors underline"
                  whileHover={{ scale: 1.05 }}
                >
                  🏠 Return to Home
                </motion.button>
              </div>

              <div className="mt-8 text-sm text-spooky-cream opacity-60">
                <p>If this problem persists, the spirits suggest:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Refreshing your browser</li>
                  <li>Clearing your browser cache</li>
                  <li>Trying a different browser</li>
                  <li>Checking your internet connection</li>
                </ul>
              </div>
            </Card>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}