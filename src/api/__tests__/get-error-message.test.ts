import { getErrorMessage } from '../../utils/get-error-message';

describe('getErrorMessage', () => {
  it('formats AppleMusicError with code and operation', () => {
    expect(
      getErrorMessage({
        code: 'ITEM_NOT_FOUND',
        message: 'Song not found in catalog',
        operation: 'Player.setQueue',
      }),
    ).toBe('ITEM_NOT_FOUND: Song not found in catalog (Player.setQueue)');
  });

  it('uses message from Error instances', () => {
    expect(getErrorMessage(new Error('network down'))).toBe('network down');
  });

  it('returns fallback for empty unknown values', () => {
    expect(getErrorMessage({}, 'play failed')).toBe('play failed');
  });
});
