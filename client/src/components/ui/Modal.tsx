import React, { useEffect, useRef } from 'react';
import { focusManager, keyboardNav } from '../../utils/accessibility';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  ariaLabel,
  ariaDescribedBy
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const trapFocusCleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store previously focused element
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      // Set up focus trap
      if (modalRef.current) {
        trapFocusCleanupRef.current = focusManager.trapFocus(modalRef.current);
      }
    }

    return () => {
      // Restore body scroll
      document.body.style.overflow = 'unset';
      
      // Cleanup focus trap
      if (trapFocusCleanupRef.current) {
        trapFocusCleanupRef.current();
        trapFocusCleanupRef.current = null;
      }
      
      // Restore focus to previously focused element
      if (previousFocusRef.current) {
        focusManager.restoreFocus(previousFocusRef.current);
        previousFocusRef.current = null;
      }
    };
  }, [isOpen]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    keyboardNav.handleEscape(event as any, onClose);
  };

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-75 backdrop-blur-sm"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div 
        ref={modalRef}
        className={`relative bg-gray-800 border border-spooky-orange border-opacity-50 rounded-lg shadow-2xl ${sizeClasses[size]} w-full mx-4 max-h-[90vh] overflow-hidden`}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel || title}
        aria-describedby={ariaDescribedBy}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-spooky-orange border-opacity-30">
            <h2 
              id="modal-title"
              className="text-2xl font-bold text-spooky-orange"
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-spooky-cream hover:text-spooky-orange transition-colors duration-200 text-2xl p-1 rounded focus:outline-none focus:ring-2 focus:ring-spooky-orange"
              aria-label="Close modal"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
        )}
        
        {/* Content */}
        <div 
          id="modal-content"
          className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]"
        >
          {children}
        </div>
      </div>
    </div>
  );
};