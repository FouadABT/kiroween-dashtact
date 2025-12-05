/**
 * Notification Sound Utility
 * Handles playing notification sounds with user preferences
 */

/**
 * Notification sound settings
 */
interface NotificationSoundSettings {
  enabled: boolean;
  volume: number; // 0-1
}

/**
 * Get notification sound settings from localStorage
 */
export function getNotificationSoundSettings(): NotificationSoundSettings {
  if (typeof window === 'undefined') {
    return { enabled: true, volume: 0.5 };
  }

  try {
    const stored = localStorage.getItem('notification-sound-settings');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load notification sound settings:', error);
  }

  return { enabled: true, volume: 0.5 };
}

/**
 * Save notification sound settings to localStorage
 */
export function saveNotificationSoundSettings(settings: NotificationSoundSettings): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('notification-sound-settings', JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save notification sound settings:', error);
  }
}


/**
 * Play notification sound using Web Audio API
 */
export function playNotificationSound(): void {
  if (typeof window === 'undefined') return;

  const settings = getNotificationSoundSettings();
  if (!settings.enabled) return;

  try {
    // Create AudioContext
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create oscillator for a simple beep sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Configure sound
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // 800 Hz
    
    // Configure volume
    gainNode.gain.setValueAtTime(settings.volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    // Play sound
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
    
    // Cleanup
    oscillator.onended = () => {
      audioContext.close();
    };
  } catch (error) {
    console.error('Failed to play notification sound:', error);
  }
}

/**
 * Play notification sound using HTML5 Audio (fallback)
 */
export function playNotificationSoundHTML5(audioUrl?: string): void {
  if (typeof window === 'undefined') return;

  const settings = getNotificationSoundSettings();
  if (!settings.enabled) return;

  try {
    const audio = new Audio(audioUrl || '/sounds/notification.mp3');
    audio.volume = settings.volume;
    audio.play().catch(error => {
      console.error('Failed to play notification sound:', error);
    });
  } catch (error) {
    console.error('Failed to play notification sound:', error);
  }
}
