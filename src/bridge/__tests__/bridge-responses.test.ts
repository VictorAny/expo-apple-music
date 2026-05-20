import { BRIDGE_METHODS } from '../bridge-methods';
import { BridgeResponses } from '../bridge-responses';

describe('BridgeResponses', () => {
  it('wraps list payloads with stable keys', () => {
    expect(BridgeResponses.songs([{ id: '1' }])).toEqual({ songs: [{ id: '1' }] });
    expect(BridgeResponses.recentlyPlayedResources([])).toEqual({ recentlyPlayedItems: [] });
  });
});

describe('BRIDGE_METHODS', () => {
  it('lists every native bridge function once', () => {
    const names = BRIDGE_METHODS.map((m) => m.nativeName);
    expect(new Set(names).size).toBe(names.length);
    expect(names).toContain('catalogSearch');
    expect(names).toContain('getRecentlyPlayedResources');
  });
});
