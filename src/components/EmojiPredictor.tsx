'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaThumbsUp, FaThumbsDown, FaMagic, FaSync } from 'react-icons/fa';
import { initializeGemini, predictEmoji, storeFeedback } from '@/utils/gemini';
import { eventEmitter, EVENTS } from '@/utils/events';

export default function EmojiPredictor() {
  const [input, setInput] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [modelInitialized, setModelInitialized] = useState(false);

  // Check if API key is stored in localStorage on component mount
  useEffect(() => {
    const storedApiKey = localStorage.getItem('gemini-api-key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
      setIsApiKeySet(true);
      initializeGeminiModel(storedApiKey);
    }
    
    // Get feedback count from localStorage
    const feedbackData = JSON.parse(localStorage.getItem('emoji-prediction-feedback') || '[]');
    setFeedbackCount(feedbackData.length);
  }, []);

  const initializeGeminiModel = async (key: string) => {
    try {
      await initializeGemini(key);
      setModelInitialized(true);
      setError(null);
    } catch (error: any) {
      console.error('Error initializing Gemini:', error);
      setModelInitialized(false);
      setError(`Failed to initialize Gemini: ${error.message || 'Unknown error'}`);
    }
  };

  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setError('Please enter a valid API key');
      return;
    }
    
    if (!apiKey.startsWith('AI')) {
      setError('Invalid API key format. Gemini API keys typically start with "AI"');
      return;
    }
    
    setIsLoading(true);
    initializeGeminiModel(apiKey)
      .then(() => {
        localStorage.setItem('gemini-api-key', apiKey);
        setIsApiKeySet(true);
      })
      .catch((error) => {
        console.error('Error initializing Gemini:', error);
        setError(`Failed to initialize Gemini: ${error.message || 'Unknown error'}`);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Model başlatılmamışsa tekrar başlatmayı dene
      if (!modelInitialized) {
        await initializeGeminiModel(apiKey);
      }
      
      const emoji = await predictEmoji(input);
      setPrediction(emoji);
    } catch (error: any) {
      console.error('Error predicting emoji:', error);
      
      // Check for specific error types
      if (error.message && error.message.includes('quota exceeded')) {
        setError('Gemini API quota exceeded. Please check your billing details or try a different API key.');
      } else if (error.message && error.message.includes('model not found')) {
        setError('Gemini model not found. The API might have changed. Please try again later or check for app updates.');
      } else if (error.message && error.message.includes('not initialized')) {
        setError('Gemini model not initialized. Please try refreshing the page or changing your API key.');
        setModelInitialized(false);
      } else {
        setError(`Failed to predict emoji: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = (isCorrect: boolean) => {
    if (prediction && input) {
      const count = storeFeedback(input, prediction, isCorrect);
      setFeedbackCount(count);
      setPrediction(null);
      setInput('');
      
      // Geri bildirim verildiğinde event tetikle
      eventEmitter.emit(EVENTS.FEEDBACK_UPDATED);
    }
  };

  const handleChangeApiKey = () => {
    localStorage.removeItem('gemini-api-key');
    setIsApiKeySet(false);
    setApiKey('');
    setError(null);
    setModelInitialized(false);
  };

  const handleRetryInitialize = () => {
    if (apiKey) {
      setIsLoading(true);
      initializeGeminiModel(apiKey)
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  if (!isApiKeySet) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center text-purple-600">AI Emoji Predictor</h2>
        <p className="mb-4 text-gray-600 text-center">
          To use this app, you need to provide your Google Gemini API key.
        </p>
        
        <form onSubmit={handleApiKeySubmit} className="space-y-4">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
              Gemini API Key
            </label>
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="AIza..."
              disabled={isLoading}
            />
          </div>
          
          <div className="text-xs text-gray-500 mt-1">
            <p>Get your API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">Google AI Studio</a></p>
          </div>
          
          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">⌛</span>
                Initializing...
              </>
            ) : (
              'Save API Key'
            )}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center text-purple-600">AI Emoji Predictor</h2>
      <p className="text-center text-sm text-gray-500 mb-4">Powered by Google Gemini</p>
      
      {!modelInitialized && !isLoading && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-700 text-sm">Gemini model is not initialized. Please try to reinitialize.</p>
          <button 
            onClick={handleRetryInitialize}
            className="text-purple-600 text-sm font-medium hover:underline mt-2 flex items-center"
          >
            <FaSync className="mr-1" /> Reinitialize Model
          </button>
        </div>
      )}
      
      <form onSubmit={handlePredict} className="mb-6">
        <div className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-grow px-4 py-2 border border-gray-300 text-black rounded-l-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter a word, phrase, or emotion..."
            disabled={isLoading || !modelInitialized}
          />
          <button
            type="submit"
            className="bg-purple-600 text-white py-2 px-4 rounded-r-md hover:bg-purple-700 transition-colors flex items-center"
            disabled={isLoading || !input.trim() || !modelInitialized}
          >
            {isLoading ? (
              <span className="animate-spin">⌛</span>
            ) : (
              <FaMagic className="mr-1" />
            )}
            {isLoading ? 'Predicting...' : 'Predict'}
          </button>
        </div>
      </form>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-500 text-sm">{error}</p>
          {(error.includes('quota exceeded') || error.includes('model not found') || error.includes('not initialized')) && (
            <button 
              onClick={handleChangeApiKey}
              className="text-purple-600 text-sm font-medium hover:underline mt-2"
            >
              Change API Key
            </button>
          )}
        </div>
      )}
      
      {prediction && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mb-6 text-center"
        >
          <div className="text-6xl mb-4">{prediction}</div>
          <p className="text-gray-600 mb-2">Is this prediction correct?</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => handleFeedback(true)}
              className="flex items-center bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
            >
              <FaThumbsUp className="mr-2" /> Yes
            </button>
            <button
              onClick={() => handleFeedback(false)}
              className="flex items-center bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors"
            >
              <FaThumbsDown className="mr-2" /> No
            </button>
          </div>
        </motion.div>
      )}
      
      <div className="text-center text-sm text-gray-500">
        <p>Feedback provided: {feedbackCount}</p>
        <button
          onClick={handleChangeApiKey}
          className="text-purple-600 hover:underline mt-2"
        >
          Change API Key
        </button>
      </div>
    </div>
  );
} 