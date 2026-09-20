/**
 * Audio Notification Utility with Web Audio API Boost, Dynamics Limiter & Cooldown Guard
 * 
 * Features:
 * - Cooldown / Debounce Guard (default 800ms) to prevent audio bursts/cacophony when multiple
 *   payments or notifications arrive simultaneously.
 * - Single Active Voice Management: cleanly fades out any previous voice so chimes never collide.
 * - Singleton AudioContext with lazy initialization and auto-resume.
 * - In-memory AudioBuffer caching for 0ms latency playback without re-fetching.
 * - Hardware-accelerated GainNode booster (default 2.2x gain) for maximum loudness.
 * - DynamicsCompressorNode to prevent audio clipping / distortion on high amplification.
 * - Seamless fallback to standard HTML5 Audio element if Web Audio API is unavailable.
 */

let sharedAudioCtx: AudioContext | null = null;
let cachedAudioBuffer: AudioBuffer | null = null;
let isFetchingBuffer = false;
const fetchWaiters: Array<(buf: AudioBuffer | null) => void> = [];

// Cooldown & Active Voice Tracking
let lastPlayedTimestamp = 0;
let activeSourceNode: AudioBufferSourceNode | null = null;
let activeGainNode: GainNode | null = null;

const DEFAULT_SOUND_PATH = '/sounds/notification.mp3';
const DEFAULT_COOLDOWN_MS = 800; // Minimum time between consecutive sound triggers

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  if (!sharedAudioCtx) {
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtxClass) {
      sharedAudioCtx = new AudioCtxClass();
    }
  }

  return sharedAudioCtx;
}

/**
 * Preloads and decodes the notification sound into memory.
 */
async function loadAudioBuffer(soundUrl: string = DEFAULT_SOUND_PATH): Promise<AudioBuffer | null> {
  if (cachedAudioBuffer) return cachedAudioBuffer;

  const ctx = getAudioContext();
  if (!ctx) return null;

  if (isFetchingBuffer) {
    return new Promise((resolve) => {
      fetchWaiters.push(resolve);
    });
  }

  isFetchingBuffer = true;

  try {
    const response = await fetch(soundUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch sound file: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    // decodeAudioData consumes arrayBuffer
    const decoded = await ctx.decodeAudioData(arrayBuffer);
    cachedAudioBuffer = decoded;

    fetchWaiters.forEach((resolve) => resolve(decoded));
    fetchWaiters.length = 0;
    return decoded;
  } catch (err) {
    console.warn('[AudioNotification] Could not decode audio buffer, will use HTML5 Audio fallback:', err);
    fetchWaiters.forEach((resolve) => resolve(null));
    fetchWaiters.length = 0;
    return null;
  } finally {
    isFetchingBuffer = false;
  }
}

// Mute State Management
const MUTE_STORAGE_KEY = 'bunsay_notif_sound_muted';

export function isNotificationSoundMuted(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(MUTE_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setNotificationSoundMuted(muted: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MUTE_STORAGE_KEY, muted ? 'true' : 'false');
  } catch {}
}

export interface PlayNotificationOptions {
  /** Sound effect URL (defaults to /sounds/notification.mp3) */
  url?: string;
  /** Volume booster multiplier (1.0 = normal, 2.0 = 200% loud, 2.5 = 250% loud). Default: 2.2 */
  gain?: number;
  /** Minimum interval (ms) between sounds to prevent overlapping cacophony (Default: 800ms) */
  cooldownMs?: number;
  /** If true, bypasses the mute check (e.g. for user testing) */
  ignoreMute?: boolean;
}

/**
 * Plays the notification sound effect with amplified volume, distortion protection,
 * and intelligent burst/cacophony prevention.
 */
export async function playNotificationSound(options: PlayNotificationOptions = {}): Promise<void> {
  if (typeof window === 'undefined') return;

  const {
    url = DEFAULT_SOUND_PATH,
    gain = 2.2,
    cooldownMs = DEFAULT_COOLDOWN_MS,
    ignoreMute = false,
  } = options;

  // 0. Mute Guard: Do not play if user muted notifications
  if (!ignoreMute && isNotificationSoundMuted()) {
    return;
  }

  const now = Date.now();
  // 1. Cooldown Guard: Suppress overlapping audio bursts if multiple notifications arrive together
  if (now - lastPlayedTimestamp < cooldownMs) {
    return;
  }
  lastPlayedTimestamp = now;

  try {
    const ctx = getAudioContext();

    if (ctx) {
      // Resume context if suspended by browser autoplay policy
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      // 2. Single Active Voice: If a previous sound is still decaying, fade it out smoothly
      if (activeSourceNode && activeGainNode) {
        try {
          activeGainNode.gain.setValueAtTime(activeGainNode.gain.value, ctx.currentTime);
          activeGainNode.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.04);
          activeSourceNode.stop(ctx.currentTime + 0.04);
        } catch {
          // Already stopped
        }
        activeSourceNode = null;
        activeGainNode = null;
      }

      const buffer = await loadAudioBuffer(url);

      if (buffer) {
        const source = ctx.createBufferSource();
        source.buffer = buffer;

        // 3. Amplification Booster
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(gain, ctx.currentTime);

        // 4. Dynamics Compressor (Limiter) to eliminate clipping/crackling at high gain
        const compressor = ctx.createDynamicsCompressor();
        compressor.threshold.setValueAtTime(-4, ctx.currentTime);
        compressor.knee.setValueAtTime(10, ctx.currentTime);
        compressor.ratio.setValueAtTime(12, ctx.currentTime);
        compressor.attack.setValueAtTime(0.003, ctx.currentTime);
        compressor.release.setValueAtTime(0.15, ctx.currentTime);

        // Audio graph routing: Source -> Gain Boost -> Compressor Limiter -> Speakers
        source.connect(gainNode);
        gainNode.connect(compressor);
        compressor.connect(ctx.destination);

        // Track current voice
        activeSourceNode = source;
        activeGainNode = gainNode;

        source.onended = () => {
          if (activeSourceNode === source) {
            activeSourceNode = null;
            activeGainNode = null;
          }
        };

        source.start(0);
        return;
      }
    }

    // Fallback: Standard HTML5 Audio element
    const fallbackAudio = new Audio(url);
    fallbackAudio.volume = 1.0;
    await fallbackAudio.play();
  } catch (err) {
    // Autoplay restrictions or user hasn't interacted yet
    console.debug('[AudioNotification] Autoplay prevented or audio unavailable:', err);
  }
}

/**
 * Optional warm-up call triggered on user's first click or navigation
 * to unlock AudioContext and cache sound immediately.
 */
export function warmUpNotificationAudio(url: string = DEFAULT_SOUND_PATH): void {
  if (typeof window === 'undefined') return;

  const unlock = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    loadAudioBuffer(url).catch(() => {});

    window.removeEventListener('click', unlock);
    window.removeEventListener('keydown', unlock);
    window.removeEventListener('touchstart', unlock);
  };

  window.addEventListener('click', unlock, { once: true, passive: true });
  window.addEventListener('keydown', unlock, { once: true, passive: true });
  window.addEventListener('touchstart', unlock, { once: true, passive: true });
}

// Expose to window for easy debugging & DevTools console testing
if (typeof window !== 'undefined') {
  (window as unknown as { playNotificationSound: typeof playNotificationSound }).playNotificationSound = playNotificationSound;
}
