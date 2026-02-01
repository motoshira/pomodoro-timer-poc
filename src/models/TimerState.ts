import * as z from 'zod';

export const TimerStateSchema = z.enum(['RUNNING', 'STOPPED']);

export type TimerState = z.infer<typeof TimerStateSchema>;
