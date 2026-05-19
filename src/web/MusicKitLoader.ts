import type { MusicKitInstance, MusicKitStatic } from './musickit-types';

const MUSIC_KIT_SCRIPT = 'https://js-cdn.music.apple.com/musickit/v3/musickit.js';

let configurePromise: Promise<MusicKitInstance> | null = null;
let developerToken: string | null = null;

function assertBrowser(): void {
  if (typeof window === 'undefined') {
    throw new Error('Apple Music web APIs require a browser environment');
  }
}

async function loadMusicKitScript(): Promise<MusicKitStatic> {
  assertBrowser();
  if (window.MusicKit) {
    return window.MusicKit;
  }

  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${MUSIC_KIT_SCRIPT}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('MusicKit JS failed to load')), {
        once: true,
      });
      if (window.MusicKit) {
        resolve();
      }
      return;
    }

    const script = document.createElement('script');
    script.src = MUSIC_KIT_SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('MusicKit JS failed to load'));
    document.head.appendChild(script);
  });

  if (!window.MusicKit) {
    throw new Error('MusicKit JS is unavailable after script load');
  }
  return window.MusicKit;
}

export function getStoredDeveloperToken(): string | null {
  return developerToken;
}

export async function configureMusicKit(token: string): Promise<MusicKitInstance> {
  assertBrowser();
  developerToken = token;

  if (!configurePromise) {
    configurePromise = (async () => {
      const MusicKit = await loadMusicKitScript();
      await MusicKit.configure({
        developerToken: token,
        app: {
          name: 'Expo Apple Music',
          build: '0.1.0',
        },
      });
      return MusicKit.getInstance();
    })();
  }

  return configurePromise;
}

export async function getMusic(): Promise<MusicKitInstance> {
  if (!configurePromise) {
    throw new Error('MusicKit is not configured. Call Auth.authorize(developerToken) first.');
  }
  return configurePromise;
}

export function resetMusicKitForTests(): void {
  configurePromise = null;
  developerToken = null;
}
