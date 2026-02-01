import * as z from 'zod';

export const CounterSchema = z
  .object({
    count: z.number().int(),
  })
  .brand<'Counter'>();

export type Counter = z.infer<typeof CounterSchema>;

// Create initial counter
export const createInitialCounter = (): Counter => {
  return CounterSchema.parse({
    count: 0,
  });
};

// Increment counter
export const increment = (counter: Counter): Counter => {
  return {
    ...counter,
    count: counter.count + 1,
  } as Counter;
};

// Decrement counter
export const decrement = (counter: Counter): Counter => {
  return {
    ...counter,
    count: counter.count - 1,
  } as Counter;
};

// Reset counter
export const reset = (counter: Counter): Counter => {
  return {
    ...counter,
    count: 0,
  } as Counter;
};
