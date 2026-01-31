import {
  createInitialModel,
  reset,
  start,
  stop,
  type TimerModel,
  tick,
  transitionToNextMode,
} from '../../src/models/TimerModel';
import {
  createDefaultSettings,
  updateSettings as updateSettingsModel,
} from '../../src/models/TimerSettings';

const createSettings = (workDuration: number, restDuration = 5) => {
  const defaults = createDefaultSettings();
  const settings = updateSettingsModel(defaults, { workDuration, restDuration });
  if (!settings) {
    throw new Error('Failed to create settings');
  }
  return settings;
};

describe('TimerModel', () => {
  describe('createInitialModel()', () => {
    it('Should create initial model with correct remainingSeconds (25 min = 1500 sec)', () => {
      const model = createInitialModel(createSettings(25));

      expect(model.remainingSeconds).toBe(1500);
    });

    it('Should create initial model with WORK mode', () => {
      const model = createInitialModel(createSettings(25));

      expect(model.currentMode).toBe('WORK');
    });

    it('Should create initial model with STOPPED state', () => {
      const model = createInitialModel(createSettings(25));

      expect(model.state).toBe('STOPPED');
    });

    it('Should handle different work durations (e.g., 50 minutes)', () => {
      const model = createInitialModel(createSettings(50));

      expect(model.remainingSeconds).toBe(3000);
    });
  });

  describe('start()', () => {
    it('Should change state from STOPPED to RUNNING', () => {
      const model = createInitialModel(createSettings(25));
      const { result, hasChanged } = start(model);

      expect(result.state).toBe('RUNNING');
      expect(hasChanged).toBe(true);
    });

    it('Should not change when already RUNNING', () => {
      const model = { ...createInitialModel(createSettings(25)), state: 'RUNNING' } as TimerModel;
      const { result, hasChanged } = start(model);

      expect(result.state).toBe('RUNNING');
      expect(hasChanged).toBe(false);
    });

    it('Should preserve other fields when starting', () => {
      const model = createInitialModel(createSettings(25));
      const { result } = start(model);

      expect(result.remainingSeconds).toBe(model.remainingSeconds);
      expect(result.currentMode).toBe(model.currentMode);
    });
  });

  describe('stop()', () => {
    it('Should change state from RUNNING to STOPPED', () => {
      const model = { ...createInitialModel(createSettings(25)), state: 'RUNNING' } as TimerModel;
      const { result, hasChanged } = stop(model);

      expect(result.state).toBe('STOPPED');
      expect(hasChanged).toBe(true);
    });

    it('Should not change when already STOPPED', () => {
      const model = createInitialModel(createSettings(25));
      const { result, hasChanged } = stop(model);

      expect(result.state).toBe('STOPPED');
      expect(hasChanged).toBe(false);
    });

    it('Should preserve other fields when stopping', () => {
      const model = { ...createInitialModel(createSettings(25)), state: 'RUNNING' } as TimerModel;
      const { result } = stop(model);

      expect(result.remainingSeconds).toBe(model.remainingSeconds);
      expect(result.currentMode).toBe(model.currentMode);
    });
  });

  describe('reset()', () => {
    it('Should reset remainingSeconds to work duration', () => {
      const settings = createSettings(25);
      const model = {
        ...createInitialModel(settings),
        remainingSeconds: 500,
        state: 'RUNNING',
      } as TimerModel;
      const result = reset(model, settings);

      expect(result.remainingSeconds).toBe(1500);
    });

    it('Should set state to STOPPED', () => {
      const settings = createSettings(25);
      const model = { ...createInitialModel(settings), state: 'RUNNING' } as TimerModel;
      const result = reset(model, settings);

      expect(result.state).toBe('STOPPED');
    });

    it('Should preserve currentMode', () => {
      const settings = createSettings(25);
      const model = {
        ...createInitialModel(settings),
        currentMode: 'REST',
      } as TimerModel;
      const result = reset(model, settings);

      expect(result.currentMode).toBe('REST');
    });

    it('Should work when already at full duration', () => {
      const settings = createSettings(25);
      const model = createInitialModel(settings);
      const result = reset(model, settings);

      expect(result.remainingSeconds).toBe(1500);
      expect(result.state).toBe('STOPPED');
    });
  });

  describe('tick()', () => {
    it('Should decrement remainingSeconds by 1', () => {
      const model = createInitialModel(createSettings(25));
      const result = tick(model);

      expect(result.remainingSeconds).toBe(1499);
    });

    it('Should not change when remainingSeconds is 0', () => {
      const model = {
        ...createInitialModel(createSettings(25)),
        remainingSeconds: 0,
      } as TimerModel;
      const result = tick(model);

      expect(result.remainingSeconds).toBe(0);
    });

    it('Should preserve other fields', () => {
      const model = createInitialModel(createSettings(25));
      const result = tick(model);

      expect(result.state).toBe(model.state);
      expect(result.currentMode).toBe(model.currentMode);
    });

    it('Should decrement from 1 to 0', () => {
      const model = {
        ...createInitialModel(createSettings(25)),
        remainingSeconds: 1,
      } as TimerModel;
      const result = tick(model);

      expect(result.remainingSeconds).toBe(0);
    });

    it('Should handle multiple ticks', () => {
      let model = createInitialModel(createSettings(25));

      model = tick(model);
      expect(model.remainingSeconds).toBe(1499);

      model = tick(model);
      expect(model.remainingSeconds).toBe(1498);

      model = tick(model);
      expect(model.remainingSeconds).toBe(1497);
    });
  });

  describe('transitionToNextMode()', () => {
    it('Should switch from WORK to REST mode', () => {
      const settings = createSettings(25, 5);
      const model = createInitialModel(settings);
      const result = transitionToNextMode(model, settings);

      expect(result.currentMode).toBe('REST');
    });

    it('Should switch from REST to WORK mode', () => {
      const settings = createSettings(25, 5);
      const model = {
        ...createInitialModel(settings),
        currentMode: 'REST',
      } as TimerModel;
      const result = transitionToNextMode(model, settings);

      expect(result.currentMode).toBe('WORK');
    });

    it('Should set state to STOPPED', () => {
      const settings = createSettings(25, 5);
      const model = {
        ...createInitialModel(settings),
        state: 'RUNNING',
      } as TimerModel;
      const result = transitionToNextMode(model, settings);

      expect(result.state).toBe('STOPPED');
    });

    it('Should reset remainingSeconds to new mode duration', () => {
      const settings = createSettings(25, 5);
      const model = {
        ...createInitialModel(settings),
        remainingSeconds: 100,
      } as TimerModel;
      const result = transitionToNextMode(model, settings);

      expect(result.remainingSeconds).toBe(300);
    });

    it('Should handle transition from WORK to REST with correct duration', () => {
      const settings = createSettings(25, 10);
      const model = createInitialModel(settings);
      const result = transitionToNextMode(model, settings);

      expect(result.currentMode).toBe('REST');
      expect(result.remainingSeconds).toBe(600); // 10 minutes
      expect(result.state).toBe('STOPPED');
    });

    it('Should handle transition from REST to WORK with correct duration', () => {
      const settings = createSettings(50, 5);
      const model = {
        ...createInitialModel(settings),
        currentMode: 'REST',
      } as TimerModel;
      const result = transitionToNextMode(model, settings);

      expect(result.currentMode).toBe('WORK');
      expect(result.remainingSeconds).toBe(3000); // 50 minutes
      expect(result.state).toBe('STOPPED');
    });
  });
});
