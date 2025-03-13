'use client';

import dynamic from 'next/dynamic';

// Use dynamic imports with no SSR for components that use browser APIs like localStorage
const EmojiPredictor = dynamic(() => import('@/components/EmojiPredictor'), { ssr: false });
const FeedbackHistory = dynamic(() => import('@/components/FeedbackHistory'), { ssr: false });

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-purple-600 mb-2">AI Emoji Predictor</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Bir kelime, deyim veya duygu yazın ve yapay zeka en uygun emojiyi tahmin etsin!
          </p>
        </header>

        <main>
          <div className="mb-8">
            <EmojiPredictor />
          </div>
          
          <FeedbackHistory />
        </main>
        
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>© 2023 AI Emoji Predictor - Powered by Google Gemini</p>
        </footer>
      </div>
    </div>
  );
}
