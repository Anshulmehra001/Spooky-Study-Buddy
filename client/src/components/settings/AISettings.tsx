import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button, Card, Modal } from '../index';

interface AISettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AISettings: React.FC<AISettingsProps> = ({ isOpen, onClose }) => {
  const [provider, setProvider] = useState<'none' | 'openai' | 'gemini'>('none');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    const savedProvider = localStorage.getItem('ai_provider') as 'none' | 'openai' | 'gemini' || 'none';
    const savedKey = localStorage.getItem('ai_api_key') || '';
    setProvider(savedProvider);
    setApiKey(savedKey);
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('ai_provider', provider);
    if (provider === 'none') {
      localStorage.removeItem('ai_api_key');
    } else {
      localStorage.setItem('ai_api_key', apiKey);
    }
    onClose();
  };

  const handleClear = () => {
    setProvider('none');
    setApiKey('');
    localStorage.removeItem('ai_provider');
    localStorage.removeItem('ai_api_key');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🤖 AI Settings">
      <div className="space-y-6">
        {/* Info */}
        <div className="bg-spooky-purple bg-opacity-20 border border-spooky-purple border-opacity-30 rounded-lg p-4">
          <p className="text-sm text-spooky-cream opacity-90">
            <strong>Optional:</strong> Add your own AI API key for enhanced story generation. 
            Without an API key, the app uses template-based stories (still works great!).
          </p>
        </div>

        {/* Provider Selection */}
        <div>
          <label className="block text-sm font-medium text-spooky-cream mb-3">
            AI Provider
          </label>
          <div className="space-y-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setProvider('none')}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                provider === 'none'
                  ? 'border-spooky-orange bg-spooky-orange bg-opacity-20'
                  : 'border-spooky-navy border-opacity-50 hover:border-opacity-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-spooky-cream">🎃 Template Mode (Default)</div>
                  <div className="text-sm text-spooky-cream opacity-70">
                    Works without API key • Fast • Free
                  </div>
                </div>
                {provider === 'none' && <span className="text-spooky-orange text-xl">✓</span>}
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setProvider('openai')}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                provider === 'openai'
                  ? 'border-spooky-orange bg-spooky-orange bg-opacity-20'
                  : 'border-spooky-navy border-opacity-50 hover:border-opacity-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-spooky-cream">🤖 OpenAI (GPT-3.5/4)</div>
                  <div className="text-sm text-spooky-cream opacity-70">
                    More creative stories • Requires API key
                  </div>
                </div>
                {provider === 'openai' && <span className="text-spooky-orange text-xl">✓</span>}
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setProvider('gemini')}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                provider === 'gemini'
                  ? 'border-spooky-orange bg-spooky-orange bg-opacity-20'
                  : 'border-spooky-navy border-opacity-50 hover:border-opacity-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-spooky-cream">✨ Google Gemini</div>
                  <div className="text-sm text-spooky-cream opacity-70">
                    Advanced AI • Requires API key
                  </div>
                </div>
                {provider === 'gemini' && <span className="text-spooky-orange text-xl">✓</span>}
              </div>
            </motion.button>
          </div>
        </div>

        {/* API Key Input */}
        {provider !== 'none' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <label className="block text-sm font-medium text-spooky-cream mb-2">
              API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={`Enter your ${provider === 'openai' ? 'OpenAI' : 'Gemini'} API key`}
                className="w-full px-4 py-3 bg-spooky-navy bg-opacity-50 border border-spooky-purple border-opacity-30 rounded-lg text-spooky-cream placeholder-spooky-cream placeholder-opacity-50 focus:outline-none focus:border-spooky-orange focus:ring-2 focus:ring-spooky-orange focus:ring-opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-spooky-cream opacity-50 hover:opacity-100"
              >
                {showKey ? '🙈' : '👁️'}
              </button>
            </div>
            <p className="mt-2 text-xs text-spooky-cream opacity-60">
              {provider === 'openai' && (
                <>Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-spooky-orange hover:underline">OpenAI Platform</a></>
              )}
              {provider === 'gemini' && (
                <>Get your API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-spooky-orange hover:underline">Google AI Studio</a></>
              )}
            </p>
            <p className="mt-1 text-xs text-spooky-cream opacity-60">
              🔒 Your API key is stored locally in your browser and never sent to our servers.
            </p>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleSave}
            variant="primary"
            className="flex-1"
            disabled={provider !== 'none' && !apiKey}
          >
            💾 Save Settings
          </Button>
          <Button
            onClick={handleClear}
            variant="ghost"
            className="flex-1"
          >
            🗑️ Clear
          </Button>
        </div>
      </div>
    </Modal>
  );
};
