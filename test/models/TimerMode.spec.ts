import { TimerModeSchema } from '../../src/models/TimerMode';

describe('TimerMode', () => {
  it('Should accept WORK mode', () => {
    const result = TimerModeSchema.safeParse('WORK');
    expect(result.success).toBe(true);
  });

  it('Should accept REST mode', () => {
    const result = TimerModeSchema.safeParse('REST');
    expect(result.success).toBe(true);
  });

  it('Should reject invalid mode', () => {
    const result = TimerModeSchema.safeParse('INVALID');
    expect(result.success).toBe(false);
  });

  it('Should have exactly 2 modes: WORK and REST', () => {
    const validModes = ['WORK', 'REST'];

    // Verify all expected modes are valid
    for (const mode of validModes) {
      expect(TimerModeSchema.safeParse(mode).success).toBe(true);
    }

    // Verify no additional modes exist by testing that other values fail
    expect(TimerModeSchema.safeParse('BREAK').success).toBe(false);
    expect(TimerModeSchema.safeParse('PAUSE').success).toBe(false);
  });
});
