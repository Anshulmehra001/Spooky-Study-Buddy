import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button, LoadingSpinner } from '../index';

interface FileUploadProps {
  onFileUpload: (content: string, fileName: string) => void;
  isProcessing?: boolean;
  maxFileSize?: number; // in MB
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  isProcessing = false,
  maxFileSize = 10
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    const maxSizeBytes = maxFileSize * 1024 * 1024;
    
    if (file.size > maxSizeBytes) {
      return `👻 Boo! File too large! Maximum size is ${maxFileSize}MB`;
    }
    
    const allowedTypes = ['text/plain', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return '🧙‍♀️ Hmm, this file type is not supported! Please use .txt or .pdf files';
    }
    
    return null;
  };

  const processFile = useCallback(async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      let content = '';
      
      if (file.type === 'text/plain') {
        content = await file.text();
      } else if (file.type === 'application/pdf') {
        // For now, we'll show an error for PDFs since we need a PDF parser
        setError('🧛 PDF support coming soon! Please use text files for now.');
        clearInterval(progressInterval);
        setUploadProgress(0);
        return;
      }

      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        onFileUpload(content, file.name);
        setUploadProgress(0);
      }, 500);

    } catch (err) {
      setError('💀 Something went wrong reading the file. Please try again!');
      setUploadProgress(0);
    }
  }, [onFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      onFileUpload(textInput.trim(), 'pasted-text.txt');
      setTextInput('');
    }
  };

  if (isProcessing) {
    return (
      <div className="max-w-2xl mx-auto">
        <LoadingSpinner 
          variant="cauldron" 
          size="lg" 
          message="🧙‍♀️ Brewing your spooky story..." 
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Drag and Drop Area - Styled as Cauldron */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-6 md:p-12 text-center transition-all duration-300 cursor-pointer touch-manipulation ${
          isDragOver
            ? 'border-spooky-orange bg-spooky-orange bg-opacity-10 scale-105'
            : 'border-spooky-orange border-opacity-50 hover:border-opacity-100 hover:bg-spooky-orange hover:bg-opacity-5 active:bg-spooky-orange active:bg-opacity-10'
        }`}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        aria-label="Upload file or drag and drop"
      >
        {/* Cauldron Visual */}
        <div className="mb-4 md:mb-6">
          <div className="text-6xl md:text-8xl mb-2">🎃</div>
          <div className="flex justify-center space-x-2 mb-4">
            <div className="w-2 h-2 bg-spooky-green rounded-full animate-ping"></div>
            <div className="w-2 h-2 bg-spooky-orange rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
            <div className="w-2 h-2 bg-spooky-purple rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>

        <h3 className="text-xl md:text-2xl font-bold text-spooky-orange mb-2">
          {window.innerWidth < 768 ? 'Tap to upload!' : 'Drop your study materials here!'}
        </h3>
        <p className="text-sm md:text-base text-spooky-cream opacity-80 mb-4 px-2">
          {window.innerWidth < 768 
            ? `Tap to choose files (.txt, .pdf up to ${maxFileSize}MB)`
            : `Or click to browse files (.txt, .pdf up to ${maxFileSize}MB)`
          }
        </p>
        
        <Button variant="primary" size={window.innerWidth < 768 ? 'md' : 'lg'}>
          🎃 Choose File
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Upload Progress */}
      {uploadProgress > 0 && (
        <div className="bg-gray-800 rounded-lg p-4 border border-spooky-orange border-opacity-30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-spooky-cream">Uploading...</span>
            <span className="text-spooky-orange">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-spooky-orange h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          className="bg-red-900 bg-opacity-50 border border-red-500 rounded-lg p-4 text-red-200"
        >
          <div className="flex items-center space-x-2">
            <motion.span 
              className="text-2xl"
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
            >
              ⚠️
            </motion.span>
            <span>{error}</span>
          </div>
        </motion.div>
      )}

      {/* OR Divider */}
      <div className="flex items-center">
        <div className="flex-1 border-t border-spooky-orange border-opacity-30"></div>
        <span className="px-4 text-spooky-cream opacity-60">OR</span>
        <div className="flex-1 border-t border-spooky-orange border-opacity-30"></div>
      </div>

      {/* Text Input Area */}
      <div className="bg-gray-800 bg-opacity-80 border border-spooky-orange border-opacity-30 rounded-lg p-4 md:p-6">
        <h3 className="text-lg md:text-xl font-bold text-spooky-orange mb-4">
          📝 Paste your text directly
        </h3>
        <textarea
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Paste your study notes, lecture content, or any text you want to transform into a spooky story..."
          className="w-full h-32 md:h-40 bg-gray-700 text-spooky-cream border border-spooky-orange border-opacity-30 rounded-lg p-3 md:p-4 resize-none focus:outline-none focus:ring-2 focus:ring-spooky-orange focus:border-transparent text-sm md:text-base touch-manipulation"
          rows={4}
        />
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 space-y-2 sm:space-y-0">
          <span className="text-xs md:text-sm text-spooky-cream opacity-60">
            {textInput.length} characters
          </span>
          <Button 
            onClick={handleTextSubmit}
            disabled={!textInput.trim()}
            variant="secondary"
            size={window.innerWidth < 640 ? 'sm' : 'md'}
            className="w-full sm:w-auto"
          >
            🧙‍♀️ Transform Text
          </Button>
        </div>
      </div>
    </div>
  );
};