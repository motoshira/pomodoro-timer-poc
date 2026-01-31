import {
  createDefaultSettings,
  type TimerSettings,
  TimerSettingsSchema,
} from '../../src/models/TimerSettings';

describe('TimerSettings', () => {
  describe('Valid Input', () => {
    it('Should validate valid settings (workDuration: 25, restDuration: 5)', () => {
      const input = {
        workDuration: 25,
        restDuration: 5,
      };

      const result = TimerSettingsSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        // Verify the parsed data is a branded TimerSettings type
        const settings: TimerSettings = result.data;
        expect(settings.workDuration).toBe(25);
        expect(settings.restDuration).toBe(5);
      }
    });

    it('Should accept positive integers for durations', () => {
      const input = {
        workDuration: 1,
        restDuration: 1,
      };

      const result = TimerSettingsSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('Should accept large values (workDuration: 120, restDuration: 60)', () => {
      const input = {
        workDuration: 120,
        restDuration: 60,
      };

      const result = TimerSettingsSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe('Invalid Input', () => {
    it('Should reject negative workDuration', () => {
      const settings = {
        workDuration: -1,
        restDuration: 5,
      };

      const result = TimerSettingsSchema.safeParse(settings);
      expect(result.success).toBe(false);
    });

    it('Should reject zero workDuration', () => {
      const settings = {
        workDuration: 0,
        restDuration: 5,
      };

      const result = TimerSettingsSchema.safeParse(settings);
      expect(result.success).toBe(false);
    });

    it('Should reject non-integer workDuration', () => {
      const settings = {
        workDuration: 25.5,
        restDuration: 5,
      };

      const result = TimerSettingsSchema.safeParse(settings);
      expect(result.success).toBe(false);
    });

    it('Should reject negative restDuration', () => {
      const settings = {
        workDuration: 25,
        restDuration: -1,
      };

      const result = TimerSettingsSchema.safeParse(settings);
      expect(result.success).toBe(false);
    });

    it('Should reject zero restDuration', () => {
      const settings = {
        workDuration: 25,
        restDuration: 0,
      };

      const result = TimerSettingsSchema.safeParse(settings);
      expect(result.success).toBe(false);
    });

    it('Should reject non-integer restDuration', () => {
      const settings = {
        workDuration: 25,
        restDuration: 5.5,
      };

      const result = TimerSettingsSchema.safeParse(settings);
      expect(result.success).toBe(false);
    });

    it('Should reject missing workDuration field', () => {
      const settings = {
        restDuration: 5,
      };

      const result = TimerSettingsSchema.safeParse(settings);
      expect(result.success).toBe(false);
    });

    it('Should reject missing restDuration field', () => {
      const settings = {
        workDuration: 25,
      };

      const result = TimerSettingsSchema.safeParse(settings);
      expect(result.success).toBe(false);
    });
  });

  describe('createDefaultSettings()', () => {
    it('Should return default settings with workDuration: 25, restDuration: 5', () => {
      const defaults = createDefaultSettings();

      expect(defaults.workDuration).toBe(25);
      expect(defaults.restDuration).toBe(5);
    });

    it('Should return valid settings according to schema', () => {
      const defaults = createDefaultSettings();
      const result = TimerSettingsSchema.safeParse(defaults);

      expect(result.success).toBe(true);
    });
  });
});
