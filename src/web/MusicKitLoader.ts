import type { MusicKitInstance, MusicKitStatic } from './musickit-types';

const MUSIC_KIT_SCRIPT = 'https://js-cdn.music.apple.com/musickit/v3/musickit.js';
const MUSIC_KIT_LOADED_EVENT = 'musickitloaded';

let configurePromise: Promise<MusicKitInstance> | null = null;
let configuredToken: string | null = null;

function assertBrowser(): void {
  if (typeof window === 'undefined') {
    throw new Error('Apple Music web APIs require a browser environment');
  }
}

/**
 * Expo / Metro define `process.env` in the browser but often omit `process.versions`.
 * MusicKit JS tests `null !== process.versions` (true when `versions` is `undefined`), then
 * reads `process.versions.node` and throws. Force a null `versions` so it picks `window.Buffer`.
 */
function patchProcessForMusicKit(): void {
  if (typeof process === 'undefined') {
    return;
  }
  if (process.versions == null) {
    // Intentionally null — see docstring above.
    Object.assign(process, { versions: null });
  }
}

function waitForMusicKitLoaded(): Promise<void> {
  return new Promise((resolve, reject) => {
    const onLoaded = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error('MusicKit JS failed to load'));
    };
    const cleanup = () => {
      document.removeEventListener(MUSIC_KIT_LOADED_EVENT, onLoaded);
      document.removeEventListener('musickiterror', onError);
    };

    document.addEventListener(MUSIC_KIT_LOADED_EVENT, onLoaded, { once: true });
    document.addEventListener('musickiterror', onError, { once: true });

    // Script may have fired the event before we subscribed.
    if (window.MusicKit?.configure) {
      cleanup();
      resolve();
    }
  });
}

async function loadMusicKitScript(): Promise<MusicKitStatic> {
  assertBrowser();
  patchProcessForMusicKit();

  if (window.MusicKit?.configure) {
    return window.MusicKit;
  }

  const existing = document.querySelector(`script[src="${MUSIC_KIT_SCRIPT}"]`);
  if (!existing) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = MUSIC_KIT_SCRIPT;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('MusicKit JS failed to load'));
      document.head.appendChild(script);
    });
  }

  await waitForMusicKitLoaded();

  if (!window.MusicKit?.configure) {
    throw new Error('MusicKit JS is unavailable after script load');
  }
  return window.MusicKit;
}

export function getStoredDeveloperToken(): string | null {
  return configuredToken;
}

export async function configureMusicKit(token: string): Promise<MusicKitInstance> {
  assertBrowser();
  const trimmed = token.trim();
  const tokenChanged = configuredToken !== null && configuredToken !== trimmed;
  configuredToken = trimmed;

  if (configurePromise && tokenChanged) {
    configurePromise = null;
  }

  if (!configurePromise) {
    configurePromise = (async () => {
      const MusicKit = await loadMusicKitScript();
      await MusicKit.configure({
        developerToken: trimmed,
        app: {
          name: 'Expo Apple Music',
          build: '0.1.0',
        },
      });
      const instance = MusicKit.getInstance();
      if (!instance) {
        throw new Error('MusicKit JS did not return an instance after configure()');
      }
      return instance;
    })();
  }

  return configurePromise;
}

export function isMusicKitConfigured(): boolean {
  return configurePromise !== null;
}

/** Returns null when `authorize()` has not configured MusicKit yet (or configure failed). */
export async function getMusicIfConfigured(): Promise<MusicKitInstance | null> {
  if (!configurePromise) {
    return null;
  }
  try {
    return await configurePromise;
  } catch {
    return null;
  }
}

export async function getMusic(): Promise<MusicKitInstance> {
  const music = await getMusicIfConfigured();
  if (!music) {
    throw new Error('MusicKit is not configured. Call Auth.authorize(developerToken) first.');
  }
  return music;
}

/** Prefer after `authorize()` — MusicKit may update the singleton instance in place. */
export async function getMusicKitInstance(): Promise<MusicKitInstance> {
  const MusicKit = await loadMusicKitScript();
  const instance = MusicKit.getInstance();
  if (!instance) {
    throw new Error('MusicKit JS did not return an instance');
  }
  return instance;
}

export function resetMusicKitForTests(): void {
  configurePromise = null;
  configuredToken = null;
}
