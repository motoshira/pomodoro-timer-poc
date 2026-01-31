import { TimerMode } from '../../src/models/TimerMode';

describe('TimerMode', () => {
  it('Should define WORK mode constant', () => {
    expect(TimerMode.WORK).toBe('WORK');
  });

  it('Should define REST mode constant', () => {
    expect(TimerMode.REST).toBe('REST');
  });

  it('Should have exactly 2 modes', () => {
    const modes = Object.values(TimerMode);
    expect(modes.length).toBe(2);
  });
});
