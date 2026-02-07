import * as z from 'zod';
import { type TimerMode, TimerModeSchema } from './TimerMode';
import type { TimerSettings } from './TimerSettings';
import { TimerStateSchema } from './TimerState';

export const TimerModelSchema = z
  .object({
    remainingSeconds: z.number().nonnegative().int(),
    currentMode: TimerModeSchema,
    state: TimerStateSchema,
  })
  .brand<'TimerModel'>();

export type TimerModel = z.infer<typeof TimerModelSchema>;

// Helper function to calculate duration from settings
export const calculateDurationSeconds = (settings: TimerSettings, mode: TimerMode): number => {
  const durationMinutes = mode === 'WORK' ? settings.workDuration : settings.restDuration;
  return durationMinutes * 60;
};

// Helper for creating initial model
export const createInitialModel = (settings: TimerSettings): TimerModel => {
  const workMode = TimerModeSchema.parse('WORK');
  const initialDuration = calculateDurationSeconds(settings, workMode);
  return TimerModelSchema.parse({
    remainingSeconds: initialDuration,
    currentMode: workMode,
    state: TimerStateSchema.parse('STOPPED'),
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

export const reset = (timerModel: TimerModel, settings: TimerSettings): TimerModel => {
  const durationSeconds = calculateDurationSeconds(settings, timerModel.currentMode);
  return {
    ...timerModel,
    state: 'STOPPED',
    remainingSeconds: durationSeconds,
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

export const transitionToNextMode = (
  timerModel: TimerModel,
  settings: TimerSettings,
): TimerModel => {
  const nextMode = TimerModeSchema.parse(
    timerModel.currentMode === 'WORK' ? 'REST' : 'WORK'
  );
  const durationSeconds = calculateDurationSeconds(settings, nextMode);
  return {
    ...timerModel,
    currentMode: nextMode,
    state: TimerStateSchema.parse('STOPPED'),
    remainingSeconds: durationSeconds,
  } as TimerModel;
};
