'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHistory, FaCheck, FaTimes, FaTrash } from 'react-icons/fa';
import { eventEmitter, EVENTS } from '@/utils/events';

type FeedbackItem = {
  input: string;
  predictedEmoji: string;
  isCorrect: boolean;
  timestamp: string;
};

export default function FeedbackHistory() {
  const [feedbackData, setFeedbackData] = useState<FeedbackItem[]>([]);
  const [refreshKey, setRefreshKey] = useState(0); // Zorla yenileme için key

  // Verileri yükle
  const loadFeedbackData = useCallback(() => {
    const storedFeedback = JSON.parse(localStorage.getItem('emoji-prediction-feedback') || '[]');
    setFeedbackData(storedFeedback);
    // Yeni bir key oluşturarak AnimatePresence'ın yeni öğeleri animasyonla göstermesini sağla
    setRefreshKey(prev => prev + 1);
  }, []);

  useEffect(() => {
    // Sayfa yüklendiğinde verileri yükle
    loadFeedbackData();

    // Geri bildirim güncellendiğinde verileri yeniden yükle
    const handleFeedbackUpdated = () => {
      loadFeedbackData();
    };

    // Event dinleyicisini ekle
    eventEmitter.on(EVENTS.FEEDBACK_UPDATED, handleFeedbackUpdated);

    // localStorage değişikliklerini dinle (farklı sekmelerde güncelleme için)
    window.addEventListener('storage', loadFeedbackData);

    // Temizleme fonksiyonu
    return () => {
      eventEmitter.off(EVENTS.FEEDBACK_UPDATED, handleFeedbackUpdated);
      window.removeEventListener('storage', loadFeedbackData);
    };
  }, [loadFeedbackData]);

  const clearHistory = () => {
    if (confirm('Tüm tahmin geçmişini silmek istediğinize emin misiniz?')) {
      localStorage.setItem('emoji-prediction-feedback', '[]');
      setFeedbackData([]);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (feedbackData.length === 0) {
    return (
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-purple-600">Tahmin Geçmişi</h3>
        </div>
        <p className="text-gray-600 text-sm">Henüz tahmin geçmişi bulunmuyor.</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="flex justify-between items-center p-4 bg-purple-50 border-b border-gray-200">
          <h3 className="font-bold text-purple-600">Tahmin Geçmişi</h3>
          {feedbackData.length > 0 && (
            <button 
              onClick={clearHistory}
              className="text-red-500 hover:text-red-700 flex items-center text-sm"
              title="Geçmişi temizle"
            >
              <FaTrash className="mr-1" /> Temizle
            </button>
          )}
        </div>
        
        <div className="divide-y divide-gray-200">
          <AnimatePresence key={refreshKey}>
            {feedbackData.slice().reverse().map((item, index) => (
              <motion.div 
                key={`${item.timestamp}-${index}`}
                className="p-3 hover:bg-gray-50 transition-colors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-center">
                  <div className="text-2xl mr-3">{item.predictedEmoji}</div>
                  <div className="flex-grow">
                    <p className="font-medium text-gray-800">{item.input}</p>
                    <p className="text-xs text-gray-500">{formatDate(item.timestamp)}</p>
                  </div>
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${item.isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {item.isCorrect ? <FaCheck /> : <FaTimes />}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
} 