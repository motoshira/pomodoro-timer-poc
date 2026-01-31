import { z } from 'zod';
import { TimerModeSchema } from './TimerMode';
import { TimerStateSchema } from './TimerState';

export const TimerModelSchema = z
  .object({
    remainingSeconds: z.number().nonnegative().int(),
    currentMode: TimerModeSchema,
    state: TimerStateSchema,
    totalSeconds: z.number().positive().int(),
  })
  .brand<'TimerModel'>();

export type TimerModel = z.infer<typeof TimerModelSchema>;

// Helper for creating initial model
export const createInitialModel = (workDurationMinutes: number): TimerModel => {
  return TimerModelSchema.parse({
    remainingSeconds: workDurationMinutes * 60,
    currentMode: 'WORK',
    state: 'STOPPED',
    totalSeconds: workDurationMinutes * 60,
  });
};
