import { TimerMode } from '../../src/models/TimerMode';
import { createInitialModel, type TimerModel, TimerModelSchema } from '../../src/models/TimerModel';
import { TimerState } from '../../src/models/TimerState';

describe('TimerModel', () => {
  describe('Valid Input', () => {
    it('Should validate valid model state', () => {
      const model: TimerModel = {
        remainingSeconds: 1500,
        currentMode: TimerMode.WORK,
        state: TimerState.STOPPED,
        totalSeconds: 1500,
      };

      const result = TimerModelSchema.safeParse(model);
      expect(result.success).toBe(true);
    });

    it('Should accept remainingSeconds = 0 (nonnegative)', () => {
      const model: TimerModel = {
        remainingSeconds: 0,
        currentMode: TimerMode.WORK,
        state: TimerState.STOPPED,
        totalSeconds: 1500,
      };

      const result = TimerModelSchema.safeParse(model);
      expect(result.success).toBe(true);
    });

    it('Should accept WORK mode', () => {
      const model: TimerModel = {
        remainingSeconds: 1500,
        currentMode: TimerMode.WORK,
        state: TimerState.STOPPED,
        totalSeconds: 1500,
      };

      const result = TimerModelSchema.safeParse(model);
      expect(result.success).toBe(true);
    });

    it('Should accept REST mode', () => {
      const model: TimerModel = {
        remainingSeconds: 300,
        currentMode: TimerMode.REST,
        state: TimerState.STOPPED,
        totalSeconds: 300,
      };

      const result = TimerModelSchema.safeParse(model);
      expect(result.success).toBe(true);
    });

    it('Should accept RUNNING state', () => {
      const model: TimerModel = {
        remainingSeconds: 1500,
        currentMode: TimerMode.WORK,
        state: TimerState.RUNNING,
        totalSeconds: 1500,
      };

      const result = TimerModelSchema.safeParse(model);
      expect(result.success).toBe(true);
    });

    it('Should accept STOPPED state', () => {
      const model: TimerModel = {
        remainingSeconds: 1500,
        currentMode: TimerMode.WORK,
        state: TimerState.STOPPED,
        totalSeconds: 1500,
      };

      const result = TimerModelSchema.safeParse(model);
      expect(result.success).toBe(true);
    });
  });

  describe('Invalid Input', () => {
    it('Should reject negative remainingSeconds', () => {
      const model = {
        remainingSeconds: -1,
        currentMode: TimerMode.WORK,
        state: TimerState.STOPPED,
        totalSeconds: 1500,
      };

      const result = TimerModelSchema.safeParse(model);
      expect(result.success).toBe(false);
    });

    it('Should reject non-integer remainingSeconds', () => {
      const model = {
        remainingSeconds: 1500.5,
        currentMode: TimerMode.WORK,
        state: TimerState.STOPPED,
        totalSeconds: 1500,
      };

      const result = TimerModelSchema.safeParse(model);
      expect(result.success).toBe(false);
    });

    it('Should reject invalid currentMode value', () => {
      const model = {
        remainingSeconds: 1500,
        currentMode: 'INVALID_MODE',
        state: TimerState.STOPPED,
        totalSeconds: 1500,
      };

      const result = TimerModelSchema.safeParse(model);
      expect(result.success).toBe(false);
    });

    it('Should reject invalid state value', () => {
      const model = {
        remainingSeconds: 1500,
        currentMode: TimerMode.WORK,
        state: 'INVALID_STATE',
        totalSeconds: 1500,
      };

      const result = TimerModelSchema.safeParse(model);
      expect(result.success).toBe(false);
    });

    it('Should reject zero totalSeconds', () => {
      const model = {
        remainingSeconds: 0,
        currentMode: TimerMode.WORK,
        state: TimerState.STOPPED,
        totalSeconds: 0,
      };

      const result = TimerModelSchema.safeParse(model);
      expect(result.success).toBe(false);
    });

    it('Should reject negative totalSeconds', () => {
      const model = {
        remainingSeconds: 1500,
        currentMode: TimerMode.WORK,
        state: TimerState.STOPPED,
        totalSeconds: -1,
      };

      const result = TimerModelSchema.safeParse(model);
      expect(result.success).toBe(false);
    });

    it('Should reject non-integer totalSeconds', () => {
      const model = {
        remainingSeconds: 1500,
        currentMode: TimerMode.WORK,
        state: TimerState.STOPPED,
        totalSeconds: 1500.5,
      };

      const result = TimerModelSchema.safeParse(model);
      expect(result.success).toBe(false);
    });

    it('Should reject missing fields', () => {
      const model = {
        remainingSeconds: 1500,
        currentMode: TimerMode.WORK,
        state: TimerState.STOPPED,
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

      expect(model.currentMode).toBe(TimerMode.WORK);
    });

    it('Should create initial model with STOPPED state', () => {
      const model = createInitialModel(25);

      expect(model.state).toBe(TimerState.STOPPED);
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
});
