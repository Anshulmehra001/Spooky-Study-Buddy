import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useBreakpoint, useMobileInteractions } from '../../hooks/useResponsive';
import { keyboardNav } from '../../utils/accessibility';
import { AISettings } from '../settings/AISettings';

export const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { isMobile, isSmallScreen } = useBreakpoint();
  const { getTouchProps } = useMobileInteractions();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      keyboardNav.handleEscape(event, () => setIsMenuOpen(false));
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isMenuOpen]);

  const [showSettings, setShowSettings] = useState(false);

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/progress', label: 'Progress', icon: '📊' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-gray-800 bg-opacity-90 backdrop-blur-sm border-b border-spooky-orange border-opacity-30 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-spooky-orange hover:text-spooky-light-orange transition-colors focus:outline-none focus:ring-2 focus:ring-spooky-orange rounded-lg p-1"
            {...getTouchProps()}
          >
            <span className={`${isMobile ? 'text-xl' : 'text-2xl'}`}>🎃</span>
            <span className={`font-creepster ${isMobile ? 'text-lg' : 'text-xl'} ${isSmallScreen ? 'hidden' : 'block'}`}>
              {isMobile ? 'Spooky' : 'Spooky Study Buddy'}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-spooky-orange text-white'
                    : 'text-spooky-cream hover:text-spooky-orange hover:bg-spooky-orange hover:bg-opacity-20'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-spooky-cream hover:text-spooky-orange hover:bg-spooky-orange hover:bg-opacity-20 transition-all"
            >
              <span>⚙️</span>
              <span>AI Settings</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            {...getTouchProps(() => setIsMenuOpen(!isMenuOpen))}
            className="md:hidden text-spooky-cream hover:text-spooky-orange transition-colors p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-spooky-orange touch-manipulation"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
          >
            <span className="text-2xl" aria-hidden="true">
              {isMenuOpen ? '✕' : '☰'}
            </span>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div 
            className="md:hidden py-4 border-t border-spooky-orange border-opacity-30"
            role="menu"
            aria-label="Mobile navigation menu"
          >
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                {...getTouchProps(() => setIsMenuOpen(false))}
                className={`flex items-center space-x-3 px-4 py-4 rounded-lg transition-all duration-200 touch-manipulation focus:outline-none focus:ring-2 focus:ring-spooky-orange ${
                  isActive(item.path)
                    ? 'bg-spooky-orange text-white'
                    : 'text-spooky-cream hover:text-spooky-orange hover:bg-spooky-orange hover:bg-opacity-20 active:bg-spooky-orange active:bg-opacity-30'
                }`}
                role="menuitem"
              >
                <span className="text-xl" aria-hidden="true">{item.icon}</span>
                <span className="text-lg">{item.label}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
      
      <AISettings isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </nav>
  );
};