import { TimerSettingsSchema } from '../../src/models/TimerSettings';
import { TimerViewModel } from '../../src/viewModels/TimerViewModel';
import { FakeTimerService } from '../services/FakeTimerService';
import { MockSettingsStorage } from '../services/MockSettingsStorage';

describe('TimerViewModel', () => {
  let timerService: FakeTimerService;
  let storage: MockSettingsStorage;
  let viewModel: TimerViewModel;

  beforeEach(() => {
    timerService = new FakeTimerService();
    storage = new MockSettingsStorage();
    viewModel = new TimerViewModel(timerService, storage);
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
      const customViewModel = new TimerViewModel(timerService, customStorage);

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
});
