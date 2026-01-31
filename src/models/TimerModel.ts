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

export const start = (
  timerModel: TimerModel,
): {
  result: TimerModel;
  hasChanged: boolean;
} => {
  if (timerModel.state === 'RUNNING') {
    return {
      result: timerModel,
      hasChanged: false,
    };
  }
  const result = {
    ...timerModel,
    state: 'RUNNING',
  } as TimerModel;
  return {
    result: result,
    hasChanged: true,
  };
};

// todo
export const stop = (
  timerModel: TimerModel,
): {
  result: TimerModel;
  hasChanged: boolean;
} => {
  if (timerModel.state === 'STOPPED') {
    return {
      result: timerModel,
      hasChanged: false,
    };
  }
  const result = {
    ...timerModel,
    state: 'STOPPED',
  } as TimerModel;
  return {
    result: result,
    hasChanged: true,
  };
};

export const reset = (timerModel: TimerModel): TimerModel => {
  return {
    ...timerModel,
    state: 'STOPPED',
    remainingSeconds: timerModel.totalSeconds,
  } as TimerModel;
};

// decrement remaining seconds (when zero do nothing)
// `transitionToNextMode` should be handled outside of this function
export const tick = (timerModel: TimerModel): TimerModel => {
  if (timerModel.remainingSeconds === 0) {
    return timerModel;
  }
  return {
    ...timerModel,
    remainingSeconds: timerModel.remainingSeconds - 1,
  } as TimerModel;
};

export const resetToCurrentMode = (timerModel: TimerModel): TimerModel => {
  return {
    ...timerModel,
    remainingSeconds: timerModel.totalSeconds,
  } as TimerModel;
};

export const transitionToNextMode = (
  timerModel: TimerModel,
  nextModeDurationMinutes: number,
): TimerModel => {
  const nextMode = timerModel.currentMode === 'WORK' ? 'REST' : 'WORK';
  const totalSeconds = nextModeDurationMinutes * 60;
  return {
    ...timerModel,
    currentMode: nextMode,
    state: 'STOPPED',
    totalSeconds: totalSeconds,
    remainingSeconds: totalSeconds,
  } as TimerModel;
};
