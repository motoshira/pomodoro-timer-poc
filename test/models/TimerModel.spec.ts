import {
  createInitialModel,
  reset,
  resetToCurrentMode,
  start,
  stop,
  type TimerModel,
  TimerModelSchema,
  tick,
  transitionToNextMode,
} from '../../src/models/TimerModel';

describe('TimerModel', () => {
  describe('Valid Input', () => {
    it('Should validate valid model state', () => {
      const input = {
        remainingSeconds: 1500,
        currentMode: 'WORK' as const,
        state: 'STOPPED' as const,
        totalSeconds: 1500,
      };

      const result = TimerModelSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        // Verify the parsed data is a branded TimerModel type
        const model: TimerModel = result.data;
        expect(model.remainingSeconds).toBe(1500);
      }
    });

    it('Should accept remainingSeconds = 0 (nonnegative)', () => {
      const input = {
        remainingSeconds: 0,
        currentMode: 'WORK' as const,
        state: 'STOPPED' as const,
        totalSeconds: 1500,
      };

      const result = TimerModelSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('Should accept WORK mode', () => {
      const input = {
        remainingSeconds: 1500,
        currentMode: 'WORK' as const,
        state: 'STOPPED' as const,
        totalSeconds: 1500,
      };

      const result = TimerModelSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('Should accept REST mode', () => {
      const input = {
        remainingSeconds: 300,
        currentMode: 'REST' as const,
        state: 'STOPPED' as const,
        totalSeconds: 300,
      };

      const result = TimerModelSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('Should accept RUNNING state', () => {
      const input = {
        remainingSeconds: 1500,
        currentMode: 'WORK' as const,
        state: 'RUNNING' as const,
        totalSeconds: 1500,
      };

      const result = TimerModelSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('Should accept STOPPED state', () => {
      const input = {
        remainingSeconds: 1500,
        currentMode: 'WORK' as const,
        state: 'STOPPED' as const,
        totalSeconds: 1500,
      };

      const result = TimerModelSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe('Invalid Input', () => {
    it('Should reject negative remainingSeconds', () => {
      const model = {
        remainingSeconds: -1,
        currentMode: 'WORK' as const,
        state: 'STOPPED' as const,
        totalSeconds: 1500,
      };

      const result = TimerModelSchema.safeParse(model);
      expect(result.success).toBe(false);
    });

    it('Should reject non-integer remainingSeconds', () => {
      const model = {
        remainingSeconds: 1500.5,
        currentMode: 'WORK' as const,
        state: 'STOPPED' as const,
        totalSeconds: 1500,
      };

      const result = TimerModelSchema.safeParse(model);
      expect(result.success).toBe(false);
    });

    it('Should reject invalid currentMode value', () => {
      const model = {
        remainingSeconds: 1500,
        currentMode: 'INVALID_MODE',
        state: 'STOPPED' as const,
        totalSeconds: 1500,
      };

      const result = TimerModelSchema.safeParse(model);
      expect(result.success).toBe(false);
    });

    it('Should reject invalid state value', () => {
      const model = {
        remainingSeconds: 1500,
        currentMode: 'WORK' as const,
        state: 'INVALID_STATE',
        totalSeconds: 1500,
      };

      const result = TimerModelSchema.safeParse(model);
      expect(result.success).toBe(false);
    });

    it('Should reject zero totalSeconds', () => {
      const model = {
        remainingSeconds: 0,
        currentMode: 'WORK' as const,
        state: 'STOPPED' as const,
        totalSeconds: 0,
      };

      const result = TimerModelSchema.safeParse(model);
      expect(result.success).toBe(false);
    });

    it('Should reject negative totalSeconds', () => {
      const model = {
        remainingSeconds: 1500,
        currentMode: 'WORK' as const,
        state: 'STOPPED' as const,
        totalSeconds: -1,
      };

      const result = TimerModelSchema.safeParse(model);
      expect(result.success).toBe(false);
    });

    it('Should reject non-integer totalSeconds', () => {
      const model = {
        remainingSeconds: 1500,
        currentMode: 'WORK' as const,
        state: 'STOPPED' as const,
        totalSeconds: 1500.5,
      };

      const result = TimerModelSchema.safeParse(model);
      expect(result.success).toBe(false);
    });

    it('Should reject missing fields', () => {
      const model = {
        remainingSeconds: 1500,
        currentMode: 'WORK' as const,
        state: 'STOPPED' as const,
      };

      const result = TimerModelSchema.safeParse(model);
      expect(result.success).toBe(false);
    });
  });

  describe('createInitialModel()', () => {
    it('Should create initial model with correct remainingSeconds (25 min = 1500 sec)', () => {
      const model = createInitialModel(25);

      expect(model.remainingSeconds).toBe(1500);
    });

    it('Should create initial model with WORK mode', () => {
      const model = createInitialModel(25);

      expect(model.currentMode).toBe('WORK');
    });

    it('Should create initial model with STOPPED state', () => {
      const model = createInitialModel(25);

      expect(model.state).toBe('STOPPED');
    });

    it('Should create initial model with correct totalSeconds', () => {
      const model = createInitialModel(25);

      expect(model.totalSeconds).toBe(1500);
    });

    it('Should create valid model according to schema', () => {
      const model = createInitialModel(25);
      const result = TimerModelSchema.safeParse(model);

      expect(result.success).toBe(true);
    });

    it('Should handle different work durations (e.g., 50 minutes)', () => {
      const model = createInitialModel(50);

      expect(model.remainingSeconds).toBe(3000);
      expect(model.totalSeconds).toBe(3000);
    });
  });

  describe('start()', () => {
    it('Should change state from STOPPED to RUNNING', () => {
      const model = createInitialModel(25);
      const { result, hasChanged } = start(model);

      expect(result.state).toBe('RUNNING');
      expect(hasChanged).toBe(true);
    });

    it('Should not change when already RUNNING', () => {
      const model = { ...createInitialModel(25), state: 'RUNNING' } as TimerModel;
      const { result, hasChanged } = start(model);

      expect(result.state).toBe('RUNNING');
      expect(hasChanged).toBe(false);
    });

    it('Should preserve other fields when starting', () => {
      const model = createInitialModel(25);
      const { result } = start(model);

      expect(result.remainingSeconds).toBe(model.remainingSeconds);
      expect(result.currentMode).toBe(model.currentMode);
      expect(result.totalSeconds).toBe(model.totalSeconds);
    });
  });

  describe('stop()', () => {
    it('Should change state from RUNNING to STOPPED', () => {
      const model = { ...createInitialModel(25), state: 'RUNNING' } as TimerModel;
      const { result, hasChanged } = stop(model);

      expect(result.state).toBe('STOPPED');
      expect(hasChanged).toBe(true);
    });

    it('Should not change when already STOPPED', () => {
      const model = createInitialModel(25);
      const { result, hasChanged } = stop(model);

      expect(result.state).toBe('STOPPED');
      expect(hasChanged).toBe(false);
    });

    it('Should preserve other fields when stopping', () => {
      const model = { ...createInitialModel(25), state: 'RUNNING' } as TimerModel;
      const { result } = stop(model);

      expect(result.remainingSeconds).toBe(model.remainingSeconds);
      expect(result.currentMode).toBe(model.currentMode);
      expect(result.totalSeconds).toBe(model.totalSeconds);
    });
  });

  describe('reset()', () => {
    it('Should reset remainingSeconds to totalSeconds', () => {
      const model = {
        ...createInitialModel(25),
        remainingSeconds: 500,
        state: 'RUNNING',
      } as TimerModel;
      const result = reset(model);

      expect(result.remainingSeconds).toBe(1500);
      expect(result.totalSeconds).toBe(1500);
    });

    it('Should set state to STOPPED', () => {
      const model = { ...createInitialModel(25), state: 'RUNNING' } as TimerModel;
      const result = reset(model);

      expect(result.state).toBe('STOPPED');
    });

    it('Should preserve currentMode', () => {
      const model = {
        ...createInitialModel(25),
        currentMode: 'REST',
      } as TimerModel;
      const result = reset(model);

      expect(result.currentMode).toBe('REST');
    });

    it('Should work when already at totalSeconds', () => {
      const model = createInitialModel(25);
      const result = reset(model);

      expect(result.remainingSeconds).toBe(1500);
      expect(result.state).toBe('STOPPED');
    });
  });

  describe('tick()', () => {
    it('Should decrement remainingSeconds by 1', () => {
      const model = createInitialModel(25);
      const result = tick(model);

      expect(result.remainingSeconds).toBe(1499);
    });

    it('Should not change when remainingSeconds is 0', () => {
      const model = {
        ...createInitialModel(25),
        remainingSeconds: 0,
      } as TimerModel;
      const result = tick(model);

      expect(result.remainingSeconds).toBe(0);
    });

    it('Should preserve other fields', () => {
      const model = createInitialModel(25);
      const result = tick(model);

      expect(result.state).toBe(model.state);
      expect(result.currentMode).toBe(model.currentMode);
      expect(result.totalSeconds).toBe(model.totalSeconds);
    });

    it('Should decrement from 1 to 0', () => {
      const model = {
        ...createInitialModel(25),
        remainingSeconds: 1,
      } as TimerModel;
      const result = tick(model);

      expect(result.remainingSeconds).toBe(0);
    });

    it('Should handle multiple ticks', () => {
      let model = createInitialModel(25);

      model = tick(model);
      expect(model.remainingSeconds).toBe(1499);

      model = tick(model);
      expect(model.remainingSeconds).toBe(1498);

      model = tick(model);
      expect(model.remainingSeconds).toBe(1497);
    });
  });

  describe('resetToCurrentMode()', () => {
    it('Should reset remainingSeconds to totalSeconds', () => {
      const model = {
        ...createInitialModel(25),
        remainingSeconds: 500,
      } as TimerModel;
      const result = resetToCurrentMode(model);

      expect(result.remainingSeconds).toBe(1500);
    });

    it('Should preserve other fields', () => {
      const model = {
        ...createInitialModel(25),
        currentMode: 'REST',
        remainingSeconds: 100,
        state: 'RUNNING',
      } as TimerModel;
      const result = resetToCurrentMode(model);

      expect(result.state).toBe('RUNNING');
      expect(result.currentMode).toBe('REST');
      expect(result.totalSeconds).toBe(1500);
    });
  });

  describe('transitionToNextMode()', () => {
    it('Should switch from WORK to REST mode', () => {
      const model = createInitialModel(25);
      const result = transitionToNextMode(model, 5);

      expect(result.currentMode).toBe('REST');
    });

    it('Should switch from REST to WORK mode', () => {
      const model = {
        ...createInitialModel(5),
        currentMode: 'REST',
      } as TimerModel;
      const result = transitionToNextMode(model, 25);

      expect(result.currentMode).toBe('WORK');
    });

    it('Should set state to STOPPED', () => {
      const model = {
        ...createInitialModel(25),
        state: 'RUNNING',
      } as TimerModel;
      const result = transitionToNextMode(model, 5);

      expect(result.state).toBe('STOPPED');
    });

    it('Should update totalSeconds based on next mode duration', () => {
      const model = createInitialModel(25);
      const result = transitionToNextMode(model, 5);

      expect(result.totalSeconds).toBe(300); // 5 minutes = 300 seconds
    });

    it('Should reset remainingSeconds to new totalSeconds', () => {
      const model = {
        ...createInitialModel(25),
        remainingSeconds: 100,
      } as TimerModel;
      const result = transitionToNextMode(model, 5);

      expect(result.remainingSeconds).toBe(300);
    });

    it('Should handle transition from WORK to REST with correct duration', () => {
      const model = createInitialModel(25);
      const result = transitionToNextMode(model, 10);

      expect(result.currentMode).toBe('REST');
      expect(result.totalSeconds).toBe(600); // 10 minutes
      expect(result.remainingSeconds).toBe(600);
      expect(result.state).toBe('STOPPED');
    });

    it('Should handle transition from REST to WORK with correct duration', () => {
      const model = {
        ...createInitialModel(5),
        currentMode: 'REST',
      } as TimerModel;
      const result = transitionToNextMode(model, 50);

      expect(result.currentMode).toBe('WORK');
      expect(result.totalSeconds).toBe(3000); // 50 minutes
      expect(result.remainingSeconds).toBe(3000);
      expect(result.state).toBe('STOPPED');
    });
  });
});
