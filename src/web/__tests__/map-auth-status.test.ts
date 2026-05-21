import {
  authStatusFromAuthorizeError,
  authStatusFromMusicKit,
  MusicKitAuthorizationStatus,
} from '../map-auth-status';
import type { MusicKitInstance } from '../musickit-types';

function mockMusic(overrides: Partial<MusicKitInstance> = {}): MusicKitInstance {
  return {
    isAuthorized: false,
    isRestricted: false,
    authorizationStatus: MusicKitAuthorizationStatus.NOT_DETERMINED,
    authorize: async () => '',
    play: async () => {},
    pause: async () => {},
    skipToNextItem: async () => {},
    skipToPreviousItem: async () => {},
    seekToTime: async () => {},
    restart: async () => {},
    setQueue: async () => {},
    queue: {},
    player: {
      nowPlayingItem: null,
      currentPlaybackTime: 0,
      currentPlaybackDuration: 0,
      playbackState: 'none',
      isPlaying: false,
    },
    nowPlayingItem: null,
    currentPlaybackTime: 0,
    isPlaying: false,
    addEventListener: () => {},
    removeEventListener: () => {},
    api: { music: async () => ({}) },
    ...overrides,
  };
}

describe('authStatusFromMusicKit', () => {
  it('returns authorized when isAuthorized is true', () => {
    expect(authStatusFromMusicKit(mockMusic({ isAuthorized: true }))).toBe('authorized');
  });

  it('maps numeric authorizationStatus', () => {
    expect(
      authStatusFromMusicKit(
        mockMusic({ authorizationStatus: MusicKitAuthorizationStatus.DENIED }),
      ),
    ).toBe('denied');
  });

  it('maps authorize() token string to authorized when MusicKit returns a user token', () => {
    expect(
      authStatusFromMusicKit(
        mockMusic({
          isAuthorized: false,
          authorizationStatus: MusicKitAuthorizationStatus.NOT_DETERMINED,
        }),
        'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.payload.sig',
      ),
    ).toBe('authorized');
  });

  it('maps denied authorizationStatus when authorize() did not return a token', () => {
    expect(
      authStatusFromMusicKit(
        mockMusic({ authorizationStatus: MusicKitAuthorizationStatus.DENIED }),
      ),
    ).toBe('denied');
  });

  it('maps restricted flag', () => {
    expect(authStatusFromMusicKit(mockMusic({ isRestricted: true }))).toBe('restricted');
  });
});

describe('authStatusFromAuthorizeError', () => {
  it('maps subscription errors to restricted', () => {
    expect(authStatusFromAuthorizeError(new Error('NO_SUBSCRIPTION'))).toBe('restricted');
  });

  it('maps cancel errors to denied', () => {
    expect(authStatusFromAuthorizeError(new Error('AUTHORIZATION_ERROR: Unauthorized'))).toBe(
      'denied',
    );
  });
});
