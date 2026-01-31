import { FakeTimerService } from '../services/FakeTimerService';
import { MockSettingsStorage } from '../services/MockSettingsStorage';
import { TimerViewModel } from '../../src/viewModels/TimerViewModel';
import { TimerSettingsSchema } from '../../src/models/TimerSettings';

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
});
