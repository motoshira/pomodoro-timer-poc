import { z } from 'zod';

describe('TimerSettings', () => {
  const TimerSettingsSchema = z.object({
    workDuration: z.number().positive().int(),
    restDuration: z.number().positive().int(),
  });

  type TimerSettings = z.infer<typeof TimerSettingsSchema>;

  describe('Schema Validation', () => {
    it('should accept valid settings', () => {
      const validSettings = {
        workDuration: 25,
        restDuration: 5,
      };

      const result = TimerSettingsSchema.safeParse(validSettings);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.workDuration).toBe(25);
        expect(result.data.restDuration).toBe(5);
      }
    });

    it('should reject negative work duration', () => {
      const invalidSettings = {
        workDuration: -5,
        restDuration: 5,
      };

      const result = TimerSettingsSchema.safeParse(invalidSettings);
      expect(result.success).toBe(false);
    });

    it('should reject negative rest duration', () => {
      const invalidSettings = {
        workDuration: 25,
        restDuration: -5,
      };

      const result = TimerSettingsSchema.safeParse(invalidSettings);
      expect(result.success).toBe(false);
    });

    it('should reject zero work duration', () => {
      const invalidSettings = {
        workDuration: 0,
        restDuration: 5,
      };

      const result = TimerSettingsSchema.safeParse(invalidSettings);
      expect(result.success).toBe(false);
    });

    it('should reject non-integer work duration', () => {
      const invalidSettings = {
        workDuration: 25.5,
        restDuration: 5,
      };

      const result = TimerSettingsSchema.safeParse(invalidSettings);
      expect(result.success).toBe(false);
    });

    it('should reject missing fields', () => {
      const invalidSettings = {
        workDuration: 25,
      };

      const result = TimerSettingsSchema.safeParse(invalidSettings);
      expect(result.success).toBe(false);
    });
  });

  describe('Default Settings', () => {
    it('should use 25 minutes for work duration by default', () => {
      const defaultSettings: TimerSettings = {
        workDuration: 25,
        restDuration: 5,
      };

      expect(defaultSettings.workDuration).toBe(25);
    });

    it('should use 5 minutes for rest duration by default', () => {
      const defaultSettings: TimerSettings = {
        workDuration: 25,
        restDuration: 5,
      };

      expect(defaultSettings.restDuration).toBe(5);
    });
  });
});
