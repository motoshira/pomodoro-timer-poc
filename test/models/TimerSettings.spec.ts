import { createDefaultSettings } from '../../src/models/TimerSettings';

describe('TimerSettings', () => {
  describe('createDefaultSettings()', () => {
    it('Should return default settings with workDuration: 25, restDuration: 5', () => {
      const defaults = createDefaultSettings();

      expect(defaults.workDuration).toBe(25);
      expect(defaults.restDuration).toBe(5);
    });
  });
});
