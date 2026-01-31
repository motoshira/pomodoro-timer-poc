import { MockSettingsStorage } from './MockSettingsStorage';
import { TimerSettingsSchema } from '../../src/models/TimerSettings';

describe('MockSettingsStorage', () => {
  let storage: MockSettingsStorage;

  beforeEach(() => {
    storage = new MockSettingsStorage();
  });

  describe('Initialization and Default Settings', () => {
    it('Should return default settings on first load()', () => {
      const settings = storage.load();
      expect(settings.workDuration).toBe(25);
      expect(settings.restDuration).toBe(5);
    });

    it('getDefaultSettings() should return {workDuration: 25, restDuration: 5}', () => {
      const defaults = storage.getDefaultSettings();
      expect(defaults.workDuration).toBe(25);
      expect(defaults.restDuration).toBe(5);
    });
  });

  describe('Save and Load', () => {
    it('Should persist settings across save/load cycles', () => {
      const customSettings = TimerSettingsSchema.parse({ workDuration: 30, restDuration: 10 });
      storage.save(customSettings);

      const loaded = storage.load();
      expect(loaded.workDuration).toBe(30);
      expect(loaded.restDuration).toBe(10);
    });

    it('Should return a copy of settings (not reference)', () => {
      const customSettings = TimerSettingsSchema.parse({ workDuration: 30, restDuration: 10 });
      storage.save(customSettings);

      const loaded1 = storage.load();
      const loaded2 = storage.load();

      expect(loaded1).not.toBe(loaded2);
      expect(loaded1.workDuration).toBe(loaded2.workDuration);
      expect(loaded1.restDuration).toBe(loaded2.restDuration);
    });
  });

  describe('Validation', () => {
    it('Should validate settings before saving', () => {
      const invalidSettings = { workDuration: -1, restDuration: 5 };

      expect(() => storage.save(invalidSettings as any)).toThrow();
    });

    it('Should reject zero workDuration', () => {
      const invalidSettings = { workDuration: 0, restDuration: 5 };

      expect(() => storage.save(invalidSettings as any)).toThrow();
    });

    it('Should reject non-integer restDuration', () => {
      const invalidSettings = { workDuration: 25, restDuration: 5.5 };

      expect(() => storage.save(invalidSettings as any)).toThrow();
    });
  });

  describe('Reset Helper', () => {
    it('Should clear stored settings when reset() is called', () => {
      const customSettings = TimerSettingsSchema.parse({ workDuration: 30, restDuration: 10 });
      storage.save(customSettings);

      storage.reset();

      const loaded = storage.load();
      expect(loaded.workDuration).toBe(25);
      expect(loaded.restDuration).toBe(5);
    });
  });
});
