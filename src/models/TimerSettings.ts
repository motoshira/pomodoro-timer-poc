import { z } from 'zod';

export const TimerSettingsSchema = z.object({
  workDuration: z.number().positive().int(),
  restDuration: z.number().positive().int(),
});

export type TimerSettings = z.infer<typeof TimerSettingsSchema>;

// Helper for creating default settings
export const createDefaultSettings = (): TimerSettings => ({
  workDuration: 25,
  restDuration: 5,
});
