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

  it('Should have exactly 2 modes', () => {
    const modes = TimerModeSchema.options;
    expect(modes.length).toBe(2);
    expect(modes).toContain('WORK');
    expect(modes).toContain('REST');
  });
});
