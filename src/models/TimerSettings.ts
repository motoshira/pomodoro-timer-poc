import { z } from 'zod';

export const TimerSettingsSchema = z
  .object({
    workDuration: z.number().positive().int(),
    restDuration: z.number().positive().int(),
  })
  .brand<'TimerSettings'>();

export type TimerSettings = z.infer<typeof TimerSettingsSchema>;

// Helper for creating default settings
export const createDefaultSettings = (): TimerSettings => {
  return TimerSettingsSchema.parse({
    workDuration: 25,
    restDuration: 5,
  });
};

// Update settings with partial values
export const updateSettings = (
  settings: TimerSettings,
  updates: Partial<{ workDuration: number; restDuration: number }>,
): TimerSettings | null => {
  const updated = {
    ...settings,
    ...updates,
  };
  const result = TimerSettingsSchema.safeParse(updated);
  return result.success ? result.data : null;
};
