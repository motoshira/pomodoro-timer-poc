import { createDefaultSettings, updateSettings } from '../../src/models/TimerSettings';

describe('TimerSettings', () => {
  describe('createDefaultSettings()', () => {
    it('Should return default settings with workDuration: 25, restDuration: 5', () => {
      const defaults = createDefaultSettings();

      expect(defaults.workDuration).toBe(25);
      expect(defaults.restDuration).toBe(5);
    });
  });

  describe('updateSettings()', () => {
    it('Should update workDuration only', () => {
      const settings = createDefaultSettings();
      const result = updateSettings(settings, { workDuration: 50 });

      expect(result).not.toBeNull();
      expect(result?.workDuration).toBe(50);
      expect(result?.restDuration).toBe(5);
    });

    it('Should update restDuration only', () => {
      const settings = createDefaultSettings();
      const result = updateSettings(settings, { restDuration: 10 });

      expect(result).not.toBeNull();
      expect(result?.workDuration).toBe(25);
      expect(result?.restDuration).toBe(10);
    });

    it('Should update both workDuration and restDuration', () => {
      const settings = createDefaultSettings();
      const result = updateSettings(settings, { workDuration: 50, restDuration: 10 });

      expect(result).not.toBeNull();
      expect(result?.workDuration).toBe(50);
      expect(result?.restDuration).toBe(10);
    });

    it('Should return null when updating to invalid workDuration (0)', () => {
      const settings = createDefaultSettings();
      const result = updateSettings(settings, { workDuration: 0 });

      expect(result).toBeNull();
    });

    it('Should return null when updating to invalid workDuration (negative)', () => {
      const settings = createDefaultSettings();
      const result = updateSettings(settings, { workDuration: -1 });

      expect(result).toBeNull();
    });

    it('Should return null when updating to invalid restDuration (0)', () => {
      const settings = createDefaultSettings();
      const result = updateSettings(settings, { restDuration: 0 });

      expect(result).toBeNull();
    });

    it('Should return null when updating to invalid restDuration (negative)', () => {
      const settings = createDefaultSettings();
      const result = updateSettings(settings, { restDuration: -1 });

      expect(result).toBeNull();
    });

    it('Should return settings unchanged when no updates provided', () => {
      const settings = createDefaultSettings();
      const result = updateSettings(settings, {});

      expect(result).not.toBeNull();
      expect(result?.workDuration).toBe(25);
      expect(result?.restDuration).toBe(5);
    });
  });
});
