import * as z from 'zod';

export const TimerModeSchema = z.enum(['WORK', 'REST']).brand<'TimerMode'>();

export type TimerMode = z.infer<typeof TimerModeSchema>;
