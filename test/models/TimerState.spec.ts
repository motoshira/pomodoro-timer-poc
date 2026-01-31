import { TimerStateSchema } from '../../src/models/TimerState';

describe('TimerState', () => {
  it('Should accept RUNNING state', () => {
    const result = TimerStateSchema.safeParse('RUNNING');
    expect(result.success).toBe(true);
  });

  it('Should accept STOPPED state', () => {
    const result = TimerStateSchema.safeParse('STOPPED');
    expect(result.success).toBe(true);
  });

  it('Should reject invalid state', () => {
    const result = TimerStateSchema.safeParse('INVALID');
    expect(result.success).toBe(false);
  });

  it('Should have exactly 2 states', () => {
    const states = TimerStateSchema.options;
    expect(states.length).toBe(2);
    expect(states).toContain('RUNNING');
    expect(states).toContain('STOPPED');
  });
});
