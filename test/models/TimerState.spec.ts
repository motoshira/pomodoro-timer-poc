import { TimerState } from '../../src/models/TimerState';

describe('TimerState', () => {
  it('Should define RUNNING state constant', () => {
    expect(TimerState.RUNNING).toBe('RUNNING');
  });

  it('Should define STOPPED state constant', () => {
    expect(TimerState.STOPPED).toBe('STOPPED');
  });

  it('Should have exactly 2 states', () => {
    const states = Object.values(TimerState);
    expect(states.length).toBe(2);
  });
});
