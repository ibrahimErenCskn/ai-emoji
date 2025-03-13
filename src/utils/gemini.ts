import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini client
let geminiClient: GoogleGenerativeAI | null = null;
let geminiModel: any = null;

export const initializeGemini = (apiKey: string) => {
  try {
    // API anahtarı kontrolü
    if (!apiKey || !apiKey.trim() || !apiKey.startsWith('AI')) {
      throw new Error('Invalid API key format. Gemini API keys typically start with "AI"');
    }

    // Yeni bir client oluştur
    geminiClient = new GoogleGenerativeAI(apiKey);
    
    // Farklı model seçeneklerini dene
    try {
      // Önce gemini-1.5-flash modelini dene (en yeni model)
      geminiModel = geminiClient.getGenerativeModel({ model: "gemini-1.5-flash" });
      console.log('Using gemini-1.5-flash model');
    } catch (modelError) {
      console.warn('Failed to initialize gemini-1.5-flash, trying gemini-pro:', modelError);
      // Eğer başarısız olursa, gemini-pro modelini dene
      geminiModel = geminiClient.getGenerativeModel({ model: "gemini-pro" });
      console.log('Using gemini-pro model');
    }
    
    // Model başarıyla başlatıldı mı kontrol et
    if (!geminiModel) {
      throw new Error('Failed to initialize Gemini model');
    }
    
    return geminiClient;
  } catch (error) {
    console.error('Error initializing Gemini:', error);
    // Hata mesajını yukarı ilet
    throw error;
  }
};

export const getGeminiInstance = () => {
  if (!geminiClient || !geminiModel) {
    throw new Error('Gemini has not been initialized. Call initializeGemini first.');
  }
  return { client: geminiClient, model: geminiModel };
};

export const predictEmoji = async (input: string): Promise<string> => {
  try {
    // Model başlatılmış mı kontrol et
    if (!geminiModel) {
      // Eğer model başlatılmamışsa, localStorage'dan API anahtarını al ve tekrar başlatmayı dene
      const storedApiKey = localStorage.getItem('gemini-api-key');
      if (storedApiKey) {
        try {
          initializeGemini(storedApiKey);
        } catch (error) {
          console.error('Failed to reinitialize Gemini model:', error);
          throw new Error('Gemini model not initialized. Please try changing your API key.');
        }
      } else {
        throw new Error('Gemini model not initialized and no API key found.');
      }
    }
    
    // Prompt oluştur
    const prompt = `You are an emoji prediction assistant. Given the following word, phrase, or emotion, respond with only the single most appropriate emoji. No text, just the emoji: "${input}"`;
    
    // İçerik oluştur
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Sadece emojiyi çıkar
    const emojiRegex = /[\p{Emoji}]/gu;
    const emojis = text.match(emojiRegex);
    
    // İlk emojiyi döndür veya emoji bulunamazsa soru işareti döndür
    const predictedEmoji = emojis && emojis.length > 0 ? emojis[0] : "❓";
    return predictedEmoji;
  } catch (error: any) {
    console.error('Error predicting emoji with Gemini:', error);
    
    // Hata türüne göre özel mesajlar
    if (error?.message?.includes('quota') || error?.message?.includes('rate limit')) {
      throw new Error('Gemini API quota exceeded. Please check your billing details or try a different API key.');
    }
    
    if (error?.message?.includes('not found') || error?.message?.includes('404')) {
      throw new Error('Gemini model not found. The API might have changed. Please check for updates.');
    }
    
    if (error?.message?.includes('not initialized')) {
      throw new Error('Gemini model not initialized. Please try changing your API key or refreshing the page.');
    }
    
    // Genel hata durumu
    throw new Error(`Failed to predict emoji: ${error.message || 'Unknown error'}`);
  }
};

// Function to store feedback for model improvement
export const storeFeedback = (input: string, predictedEmoji: string, isCorrect: boolean) => {
  // In a real application, you would send this data to a backend
  // For this frontend-only solution, we'll store it in localStorage
  const feedbackKey = 'emoji-prediction-feedback';
  const existingFeedback = JSON.parse(localStorage.getItem(feedbackKey) || '[]');
  
  existingFeedback.push({
    input,
    predictedEmoji,
    isCorrect,
    timestamp: new Date().toISOString()
  });
  
  localStorage.setItem(feedbackKey, JSON.stringify(existingFeedback));
  
  return existingFeedback.length;
}; 