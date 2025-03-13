// Basit bir event sistemi
type EventCallback = () => void;

class EventEmitter {
  private events: Record<string, EventCallback[]> = {};

  // Event dinleyici ekle
  on(event: string, callback: EventCallback): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  // Event dinleyiciyi kaldır
  off(event: string, callback: EventCallback): void {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }

  // Event tetikle
  emit(event: string): void {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => callback());
  }
}

// Tek bir instance oluştur (singleton)
export const eventEmitter = new EventEmitter();

// Event isimleri
export const EVENTS = {
  FEEDBACK_UPDATED: 'feedback_updated'
}; 