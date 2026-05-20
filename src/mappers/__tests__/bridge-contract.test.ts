import {
  BRIDGE_CONTRACT_CASES,
  loadApiFixture,
  loadExpectedBridge,
  loadRatingsEnvelope,
} from './bridge-contract';

describe('bridge contract (fixtures → bridge objects)', () => {
  it.each(BRIDGE_CONTRACT_CASES)('$name', ({ input, expected, map }) => {
    const apiInput =
      input === 'ratings-response.json' ? loadRatingsEnvelope(input) : loadApiFixture(input);
    expect(map(apiInput)).toEqual(loadExpectedBridge(expected));
  });
});
