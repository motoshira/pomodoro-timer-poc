import { z } from 'zod';
import { TimerMode } from './TimerMode';
import { TimerState } from './TimerState';

export const TimerModelSchema = z
  .object({
    remainingSeconds: z.number().nonnegative().int(),
    currentMode: z.nativeEnum(TimerMode),
    state: z.nativeEnum(TimerState),
    totalSeconds: z.number().positive().int(),
  })
  .brand<'TimerModel'>();

export type TimerModel = z.infer<typeof TimerModelSchema>;

// Helper for creating initial model
export const createInitialModel = (workDurationMinutes: number): TimerModel => {
  return TimerModelSchema.parse({
    remainingSeconds: workDurationMinutes * 60,
    currentMode: TimerMode.WORK,
    state: TimerState.STOPPED,
    totalSeconds: workDurationMinutes * 60,
  });
};
