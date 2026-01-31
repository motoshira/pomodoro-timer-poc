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

  it('Should have exactly 2 states: RUNNING and STOPPED', () => {
    const validStates = ['RUNNING', 'STOPPED'];

    // Verify all expected states are valid
    for (const state of validStates) {
      expect(TimerStateSchema.safeParse(state).success).toBe(true);
    }

    // Verify no additional states exist by testing that other values fail
    expect(TimerStateSchema.safeParse('PAUSED').success).toBe(false);
    expect(TimerStateSchema.safeParse('IDLE').success).toBe(false);
  });
});
