import { TimerSettingsSchema } from '../../src/models/TimerSettings';
import { type TimerViewModel, createTimerViewModel } from '../../src/viewModels/TimerViewModel';
import { FakeTimerService } from '../services/FakeTimerService';
import { MockSettingsStorage } from '../services/MockSettingsStorage';

describe('TimerViewModel', () => {
  let timerService: FakeTimerService;
  let storage: MockSettingsStorage;
  let viewModel: TimerViewModel;

  beforeEach(() => {
    timerService = new FakeTimerService();
    storage = new MockSettingsStorage();
    viewModel = createTimerViewModel(timerService, storage);
  });

  describe('Initialization', () => {
    it('Should initialize with default settings', () => {
      const defaultSettings = storage.getDefaultSettings();
      expect(viewModel.settings.workDuration).toBe(defaultSettings.workDuration);
      expect(viewModel.settings.restDuration).toBe(defaultSettings.restDuration);
    });

    it('Should start in WORK mode', () => {
      expect(viewModel.currentMode).toBe('WORK');
    });

    it('Should start in STOPPED state', () => {
      expect(viewModel.state).toBe('STOPPED');
    });

    it('Should set remainingSeconds correctly', () => {
      const defaultSettings = storage.getDefaultSettings();
      const expectedSeconds = defaultSettings.workDuration * 60;
      expect(viewModel.remainingSeconds).toBe(expectedSeconds);
    });

    it('Should load settings from storage', () => {
      // Create new storage with custom settings
      const customStorage = new MockSettingsStorage();
      const customSettings = TimerSettingsSchema.parse({ workDuration: 30, restDuration: 10 });
      customStorage.save(customSettings);

      // Create new ViewModel with custom storage
      const customViewModel = createTimerViewModel(timerService, customStorage);

      expect(customViewModel.settings.workDuration).toBe(30);
      expect(customViewModel.settings.restDuration).toBe(10);
      expect(customViewModel.remainingSeconds).toBe(30 * 60);
    });
  });

  describe('Computed Properties', () => {
    describe('displayTime', () => {
      it('Should format "25:00" for 1500 seconds (25 minutes)', () => {
        expect(viewModel.displayTime).toBe('25:00');
      });

      it('Should format "01:30" for 90 seconds', () => {
        // Manually set remainingSeconds to 90
        (viewModel as any)._remainingSeconds = 90;
        expect(viewModel.displayTime).toBe('01:30');
      });

      it('Should format "00:00" for 0 seconds', () => {
        (viewModel as any)._remainingSeconds = 0;
        expect(viewModel.displayTime).toBe('00:00');
      });

      it('Should pad single digits with zeros', () => {
        (viewModel as any)._remainingSeconds = 65; // 1 minute, 5 seconds
        expect(viewModel.displayTime).toBe('01:05');
      });
    });

    describe('modeLabel', () => {
      it('Should return "Work" for WORK mode', () => {
        expect(viewModel.modeLabel).toBe('Work');
      });

      it('Should return "Rest" for REST mode', () => {
        (viewModel as any)._currentMode = 'REST';
        expect(viewModel.modeLabel).toBe('Rest');
      });
    });

    describe('modeIcon', () => {
      it('Should return work icon for WORK mode', () => {
        expect(viewModel.modeIcon).toBe('preferences-system-time-symbolic');
      });

      it('Should return rest icon for REST mode', () => {
        (viewModel as any)._currentMode = 'REST';
        expect(viewModel.modeIcon).toBe('preferences-desktop-screensaver-symbolic');
      });
    });

    describe('startStopLabel', () => {
      it('Should return "Start" for STOPPED state', () => {
        expect(viewModel.startStopLabel).toBe('Start');
      });

      it('Should return "Stop" for RUNNING state', () => {
        (viewModel as any)._state = 'RUNNING';
        expect(viewModel.startStopLabel).toBe('Stop');
      });
    });

    describe('settings', () => {
      it('Should return a copy of settings (not reference)', () => {
        const settings1 = viewModel.settings;
        const settings2 = viewModel.settings;

        expect(settings1).not.toBe(settings2);
        expect(settings1.workDuration).toBe(settings2.workDuration);
        expect(settings1.restDuration).toBe(settings2.restDuration);
      });
    });
  });

  describe('start() and stop() Methods', () => {
    describe('start()', () => {
      it('Should change state to RUNNING', () => {
        viewModel.start();
        expect(viewModel.state).toBe('RUNNING');
      });

      it('Should start timer via TimerService', () => {
        viewModel.start();
        expect(timerService.getActiveCount()).toBe(1);
      });

      it('Should do nothing if already RUNNING', () => {
        viewModel.start();
        const firstTimerId = timerService.getActiveCount();

        viewModel.start(); // Try to start again
        const secondTimerId = timerService.getActiveCount();

        expect(firstTimerId).toBe(secondTimerId);
      });

      it('Should register a callback with 1000ms interval', () => {
        const startTimerSpy = spyOn(timerService, 'startTimer').and.callThrough();
        viewModel.start();

        expect(startTimerSpy).toHaveBeenCalledWith(jasmine.any(Function), 1000);
      });
    });

    describe('stop()', () => {
      it('Should change state to STOPPED', () => {
        viewModel.start();
        viewModel.stop();
        expect(viewModel.state).toBe('STOPPED');
      });

      it('Should stop timer via TimerService', () => {
        viewModel.start();
        expect(timerService.getActiveCount()).toBe(1);

        viewModel.stop();
        expect(timerService.getActiveCount()).toBe(0);
      });

      it('Should do nothing if already STOPPED', () => {
        // Initially STOPPED, try to stop again
        const initialCount = timerService.getActiveCount();
        viewModel.stop();
        expect(timerService.getActiveCount()).toBe(initialCount);
      });
    });
  });

  describe('_tick() Method', () => {
    it('Should decrement remainingSeconds by 1', () => {
      const initialSeconds = viewModel.remainingSeconds;
      viewModel.start();

      const timerId = timerService.getActiveCount() > 0 ? 1 : 0;
      timerService.tick(timerId);

      expect(viewModel.remainingSeconds).toBe(initialSeconds - 1);
    });

    it('Should return true when remainingSeconds > 0', () => {
      viewModel.start();
      const timerId = 1;
      const result = timerService.tick(timerId);

      expect(result).toBe(true);
      expect(timerService.isActive(timerId)).toBe(true);
    });

    it('Should return false when reaching 0', () => {
      // Set to 1 second remaining
      (viewModel as any)._remainingSeconds = 1;
      viewModel.start();

      const timerId = 1;
      const result = timerService.tick(timerId);

      expect(result).toBe(false);
      expect(timerService.isActive(timerId)).toBe(false);
    });

    it('Should call _transitionToNextMode() when reaching 0', () => {
      const transitionSpy = spyOn(viewModel as any, '_transitionToNextMode');

      // Set to 1 second remaining
      (viewModel as any)._remainingSeconds = 1;
      viewModel.start();

      const timerId = 1;
      timerService.tick(timerId);

      expect(transitionSpy).toHaveBeenCalled();
    });

    it('Should continuously decrement on multiple ticks', () => {
      const initialSeconds = viewModel.remainingSeconds;
      viewModel.start();

      const timerId = 1;
      timerService.tick(timerId);
      timerService.tick(timerId);
      timerService.tick(timerId);

      expect(viewModel.remainingSeconds).toBe(initialSeconds - 3);
    });
  });

  describe('Mode Transitions', () => {
    describe('_transitionToNextMode()', () => {
      it('Should transition from WORK to REST', () => {
        expect(viewModel.currentMode).toBe('WORK');

        // Trigger transition
        (viewModel as any)._transitionToNextMode();

        expect(viewModel.currentMode).toBe('REST');
      });

      it('Should transition from REST to WORK', () => {
        // Set to REST mode first
        (viewModel as any)._currentMode = 'REST';

        // Trigger transition
        (viewModel as any)._transitionToNextMode();

        expect(viewModel.currentMode).toBe('WORK');
      });

      it('Should set state to STOPPED after transition', () => {
        viewModel.start();
        expect(viewModel.state).toBe('RUNNING');

        // Trigger transition
        (viewModel as any)._transitionToNextMode();

        expect(viewModel.state).toBe('STOPPED');
      });

      it("Should set remainingSeconds to new mode's duration (WORK → REST)", () => {
        const settings = storage.getDefaultSettings();
        const expectedRestSeconds = settings.restDuration * 60;

        // Trigger transition from WORK to REST
        (viewModel as any)._transitionToNextMode();

        expect(viewModel.remainingSeconds).toBe(expectedRestSeconds);
      });

      it("Should set remainingSeconds to new mode's duration (REST → WORK)", () => {
        const settings = storage.getDefaultSettings();
        const expectedWorkSeconds = settings.workDuration * 60;

        // Set to REST mode first
        (viewModel as any)._currentMode = 'REST';

        // Trigger transition from REST to WORK
        (viewModel as any)._transitionToNextMode();

        expect(viewModel.remainingSeconds).toBe(expectedWorkSeconds);
      });
    });
  });

  describe('skip() and reset() Methods', () => {
    describe('skip()', () => {
      it('Should transition to next mode', () => {
        expect(viewModel.currentMode).toBe('WORK');

        viewModel.skip();

        expect(viewModel.currentMode).toBe('REST');
      });

      it('Should set state to STOPPED', () => {
        viewModel.start();
        expect(viewModel.state).toBe('RUNNING');

        viewModel.skip();

        expect(viewModel.state).toBe('STOPPED');
      });

      it('Should stop running timer if active', () => {
        viewModel.start();
        expect(timerService.getActiveCount()).toBe(1);

        viewModel.skip();

        expect(timerService.getActiveCount()).toBe(0);
      });

      it('Should work when already stopped', () => {
        expect(viewModel.state).toBe('STOPPED');

        viewModel.skip();

        expect(viewModel.state).toBe('STOPPED');
        expect(viewModel.currentMode).toBe('REST');
      });
    });

    describe('reset()', () => {
      it('Should reset remainingSeconds to totalSeconds', () => {
        // Decrement the timer
        viewModel.start();
        timerService.tick(1);
        timerService.tick(1);
        timerService.tick(1);

        const initialTotal = viewModel.settings.workDuration * 60;
        expect(viewModel.remainingSeconds).toBe(initialTotal - 3);

        viewModel.reset();

        expect(viewModel.remainingSeconds).toBe(initialTotal);
      });

      it('Should set state to STOPPED', () => {
        viewModel.start();
        expect(viewModel.state).toBe('RUNNING');

        viewModel.reset();

        expect(viewModel.state).toBe('STOPPED');
      });

      it('Should keep current mode unchanged', () => {
        const modeBefore = viewModel.currentMode;

        viewModel.reset();

        expect(viewModel.currentMode).toBe(modeBefore);
      });

      it('Should stop running timer if active', () => {
        viewModel.start();
        expect(timerService.getActiveCount()).toBe(1);

        viewModel.reset();

        expect(timerService.getActiveCount()).toBe(0);
      });

      it('Should work when already stopped', () => {
        viewModel.reset();

        expect(viewModel.state).toBe('STOPPED');
      });

      it('Should work correctly in REST mode', () => {
        // Skip to REST mode
        viewModel.skip();
        expect(viewModel.currentMode).toBe('REST');

        // Start and decrement
        viewModel.start();
        timerService.tick(1);

        const expectedRestSeconds = viewModel.settings.restDuration * 60;
        expect(viewModel.remainingSeconds).toBe(expectedRestSeconds - 1);

        // Reset should restore REST duration
        viewModel.reset();

        expect(viewModel.remainingSeconds).toBe(expectedRestSeconds);
        expect(viewModel.currentMode).toBe('REST');
      });
    });
  });

  describe('updateSettings() Method', () => {
    it('Should update internal settings', () => {
      const newSettings = TimerSettingsSchema.parse({ workDuration: 30, restDuration: 10 });

      viewModel.updateSettings(newSettings);

      expect(viewModel.settings.workDuration).toBe(30);
      expect(viewModel.settings.restDuration).toBe(10);
    });

    it('Should persist to storage', () => {
      const newSettings = TimerSettingsSchema.parse({ workDuration: 30, restDuration: 10 });

      viewModel.updateSettings(newSettings);

      const loadedSettings = storage.load();
      expect(loadedSettings.workDuration).toBe(30);
      expect(loadedSettings.restDuration).toBe(10);
    });

    it('Should reset timer if in STOPPED state (WORK mode)', () => {
      expect(viewModel.state).toBe('STOPPED');
      expect(viewModel.currentMode).toBe('WORK');

      const newSettings = TimerSettingsSchema.parse({ workDuration: 30, restDuration: 10 });
      viewModel.updateSettings(newSettings);

      // Should apply new work duration
      expect(viewModel.remainingSeconds).toBe(30 * 60);
    });

    it('Should reset timer if in STOPPED state (REST mode)', () => {
      viewModel.skip(); // Go to REST mode
      expect(viewModel.state).toBe('STOPPED');
      expect(viewModel.currentMode).toBe('REST');

      const newSettings = TimerSettingsSchema.parse({ workDuration: 30, restDuration: 10 });
      viewModel.updateSettings(newSettings);

      // Should apply new rest duration
      expect(viewModel.remainingSeconds).toBe(10 * 60);
    });

    it('Should not affect running timer until current cycle completes', () => {
      viewModel.start();
      const initialSeconds = viewModel.remainingSeconds;

      const newSettings = TimerSettingsSchema.parse({ workDuration: 30, restDuration: 10 });
      viewModel.updateSettings(newSettings);

      // Should NOT change remainingSeconds while running
      expect(viewModel.remainingSeconds).toBe(initialSeconds);

      // Tick a few times
      timerService.tick(1);
      timerService.tick(1);

      // Still should be using old duration
      expect(viewModel.remainingSeconds).toBe(initialSeconds - 2);
    });

    it('Should apply new settings after running timer completes cycle', () => {
      // Set to 1 second remaining and start
      (viewModel as any)._remainingSeconds = 1;
      viewModel.start();

      const newSettings = TimerSettingsSchema.parse({ workDuration: 30, restDuration: 10 });
      viewModel.updateSettings(newSettings);

      // Complete the cycle (tick to 0, will transition to REST)
      timerService.tick(1);

      // Now should be in REST mode with new settings
      expect(viewModel.currentMode).toBe('REST');
      expect(viewModel.remainingSeconds).toBe(10 * 60); // New rest duration
    });
  });

  describe('Integration Tests', () => {
    describe('Full Cycles', () => {
      it('Full work cycle: start → tick to 0 → auto transition to REST', () => {
        // Set to 3 seconds for quick test
        (viewModel as any)._remainingSeconds = 3;
        (viewModel as any)._totalSeconds = 3;

        viewModel.start();
        expect(viewModel.state).toBe('RUNNING');
        expect(viewModel.currentMode).toBe('WORK');

        // Tick down to 0
        timerService.tick(1); // 2 seconds
        expect(viewModel.remainingSeconds).toBe(2);
        timerService.tick(1); // 1 second
        expect(viewModel.remainingSeconds).toBe(1);
        timerService.tick(1); // 0 seconds - should transition

        // Should auto-transition to REST and STOPPED
        expect(viewModel.currentMode).toBe('REST');
        expect(viewModel.state).toBe('STOPPED');
        expect(viewModel.remainingSeconds).toBe(5 * 60); // Default rest duration
      });

      it('Full rest cycle: REST → tick to 0 → auto transition to WORK', () => {
        // Go to REST mode
        viewModel.skip();
        expect(viewModel.currentMode).toBe('REST');

        // Set to 3 seconds for quick test
        (viewModel as any)._remainingSeconds = 3;
        (viewModel as any)._totalSeconds = 3;

        viewModel.start();

        // Tick down to 0
        timerService.tick(1); // 2 seconds
        timerService.tick(1); // 1 second
        timerService.tick(1); // 0 seconds - should transition

        // Should auto-transition to WORK and STOPPED
        expect(viewModel.currentMode).toBe('WORK');
        expect(viewModel.state).toBe('STOPPED');
        expect(viewModel.remainingSeconds).toBe(25 * 60); // Default work duration
      });
    });

    describe('Operation Combinations', () => {
      it('Start/Stop/Start sequence', () => {
        viewModel.start();
        expect(viewModel.state).toBe('RUNNING');

        timerService.tick(1); // First timer ID is 1
        const remainingAfterTick = viewModel.remainingSeconds;

        viewModel.stop();
        expect(viewModel.state).toBe('STOPPED');
        expect(viewModel.remainingSeconds).toBe(remainingAfterTick);

        // Start again - should continue from where it stopped
        viewModel.start(); // This creates a new timer with ID 2
        expect(viewModel.state).toBe('RUNNING');
        timerService.tick(2); // Use timer ID 2
        expect(viewModel.remainingSeconds).toBe(remainingAfterTick - 1);
      });

      it('Skip while running should stop timer and transition', () => {
        viewModel.start();
        expect(viewModel.state).toBe('RUNNING');
        expect(viewModel.currentMode).toBe('WORK');

        timerService.tick(1);

        viewModel.skip();

        expect(viewModel.state).toBe('STOPPED');
        expect(viewModel.currentMode).toBe('REST');
        expect(timerService.getActiveCount()).toBe(0);
      });

      it('Reset while running should stop timer and restore duration', () => {
        const initialSeconds = viewModel.remainingSeconds;

        viewModel.start();
        timerService.tick(1);
        timerService.tick(1);

        viewModel.reset();

        expect(viewModel.state).toBe('STOPPED');
        expect(viewModel.remainingSeconds).toBe(initialSeconds);
        expect(timerService.getActiveCount()).toBe(0);
      });
    });

    describe('Settings During Running Timer', () => {
      it('Settings change during run should apply after transition', () => {
        // Set to 2 seconds for quick test
        (viewModel as any)._remainingSeconds = 2;
        (viewModel as any)._totalSeconds = 2;

        viewModel.start();

        // Update settings while running
        const newSettings = TimerSettingsSchema.parse({ workDuration: 10, restDuration: 3 });
        viewModel.updateSettings(newSettings);

        // Tick to completion
        timerService.tick(1);
        timerService.tick(1);

        // Should transition to REST with NEW settings
        expect(viewModel.currentMode).toBe('REST');
        expect(viewModel.remainingSeconds).toBe(3 * 60); // New rest duration
      });
    });

    describe('Edge Cases', () => {
      it('Should handle 1-minute work duration', () => {
        const settings = TimerSettingsSchema.parse({ workDuration: 1, restDuration: 1 });
        viewModel.updateSettings(settings);

        expect(viewModel.remainingSeconds).toBe(60);

        viewModel.start();
        for (let i = 0; i < 60; i++) {
          timerService.tick(1);
        }

        // Should transition to REST
        expect(viewModel.currentMode).toBe('REST');
        expect(viewModel.remainingSeconds).toBe(60);
      });

      it('Rapid start/stop/skip/reset operations', () => {
        viewModel.start();
        viewModel.stop();
        viewModel.start();
        timerService.tick(1);
        viewModel.skip();
        viewModel.start();
        viewModel.reset();

        // Should end in valid state
        expect(viewModel.state).toBe('STOPPED');
        expect(viewModel.currentMode).toBe('REST');
        expect(timerService.getActiveCount()).toBe(0);
      });

      it('Multiple complete cycles', () => {
        for (let cycle = 0; cycle < 3; cycle++) {
          // Set short duration for testing
          (viewModel as any)._remainingSeconds = 2;
          (viewModel as any)._totalSeconds = 2;

          viewModel.start();

          // Get the current timer ID (it increments with each start)
          const currentTimerId = cycle + 1;
          timerService.tick(currentTimerId);
          timerService.tick(currentTimerId);

          // After each cycle, mode should alternate
          const expectedMode = cycle % 2 === 0 ? 'REST' : 'WORK';
          expect(viewModel.currentMode).toBe(expectedMode);
          expect(viewModel.state).toBe('STOPPED');
        }
      });
    });
  });
});
