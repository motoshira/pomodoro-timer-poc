import { SettingsViewModel } from '../../src/viewModels/SettingsViewModel';
import { TimerSettingsSchema } from '../../src/models/TimerSettings';

describe('SettingsViewModel', () => {
  let viewModel: SettingsViewModel;

  beforeEach(() => {
    viewModel = new SettingsViewModel();
  });

  describe('Initialization', () => {
    it('Should initialize with empty values', () => {
      expect(viewModel.workDuration).toBe(0);
      expect(viewModel.restDuration).toBe(0);
    });

    it('Should set hasChanges to false initially', () => {
      expect(viewModel.hasChanges).toBe(false);
    });
  });

  describe('load() Method', () => {
    it('Should load settings into working copy', () => {
      const settings = TimerSettingsSchema.parse({ workDuration: 25, restDuration: 5 });

      viewModel.load(settings);

      expect(viewModel.workDuration).toBe(25);
      expect(viewModel.restDuration).toBe(5);
    });

    it('Should set hasChanges to false after loading', () => {
      const settings = TimerSettingsSchema.parse({ workDuration: 25, restDuration: 5 });

      viewModel.load(settings);

      expect(viewModel.hasChanges).toBe(false);
    });

    it('Should preserve original settings for comparison', () => {
      const settings = TimerSettingsSchema.parse({ workDuration: 25, restDuration: 5 });

      viewModel.load(settings);
      viewModel.workDuration = 30;

      expect(viewModel.hasChanges).toBe(true);
    });

    it('Should handle loading different settings multiple times', () => {
      const settings1 = TimerSettingsSchema.parse({ workDuration: 25, restDuration: 5 });
      const settings2 = TimerSettingsSchema.parse({ workDuration: 30, restDuration: 10 });

      viewModel.load(settings1);
      expect(viewModel.workDuration).toBe(25);

      viewModel.load(settings2);
      expect(viewModel.workDuration).toBe(30);
      expect(viewModel.hasChanges).toBe(false);
    });
  });

  describe('Property Changes', () => {
    beforeEach(() => {
      const settings = TimerSettingsSchema.parse({ workDuration: 25, restDuration: 5 });
      viewModel.load(settings);
    });

    it('Changing workDuration should set hasChanges to true', () => {
      viewModel.workDuration = 30;

      expect(viewModel.hasChanges).toBe(true);
    });

    it('Changing restDuration should set hasChanges to true', () => {
      viewModel.restDuration = 10;

      expect(viewModel.hasChanges).toBe(true);
    });

    it('Changing back to original value should set hasChanges to false', () => {
      viewModel.workDuration = 30;
      expect(viewModel.hasChanges).toBe(true);

      viewModel.workDuration = 25;
      expect(viewModel.hasChanges).toBe(false);
    });

    it('Changing both properties should set hasChanges to true', () => {
      viewModel.workDuration = 30;
      viewModel.restDuration = 10;

      expect(viewModel.hasChanges).toBe(true);
    });
  });

  describe('save() Method', () => {
    beforeEach(() => {
      const settings = TimerSettingsSchema.parse({ workDuration: 25, restDuration: 5 });
      viewModel.load(settings);
    });

    it('Should return TimerSettings with current values', () => {
      viewModel.workDuration = 30;
      viewModel.restDuration = 10;

      const saved = viewModel.save();

      expect(saved.workDuration).toBe(30);
      expect(saved.restDuration).toBe(10);
    });

    it('Should set hasChanges to false after saving', () => {
      viewModel.workDuration = 30;
      expect(viewModel.hasChanges).toBe(true);

      viewModel.save();

      expect(viewModel.hasChanges).toBe(false);
    });

    it('Should validate settings before returning', () => {
      viewModel.workDuration = -1; // Invalid

      expect(() => viewModel.save()).toThrow();
    });

    it('Should reject zero workDuration', () => {
      viewModel.workDuration = 0;

      expect(() => viewModel.save()).toThrow();
    });

    it('Should update original settings after save', () => {
      viewModel.workDuration = 30;
      viewModel.save();

      // Changing back should not mark as changed
      viewModel.workDuration = 25;
      expect(viewModel.hasChanges).toBe(true);

      // Changing to saved value should not mark as changed
      viewModel.workDuration = 30;
      expect(viewModel.hasChanges).toBe(false);
    });
  });

  describe('cancel() Method', () => {
    beforeEach(() => {
      const settings = TimerSettingsSchema.parse({ workDuration: 25, restDuration: 5 });
      viewModel.load(settings);
    });

    it('Should revert to loaded settings', () => {
      viewModel.workDuration = 30;
      viewModel.restDuration = 10;

      viewModel.cancel();

      expect(viewModel.workDuration).toBe(25);
      expect(viewModel.restDuration).toBe(5);
    });

    it('Should set hasChanges to false after canceling', () => {
      viewModel.workDuration = 30;
      expect(viewModel.hasChanges).toBe(true);

      viewModel.cancel();

      expect(viewModel.hasChanges).toBe(false);
    });

    it('Should do nothing if no original settings loaded', () => {
      const emptyViewModel = new SettingsViewModel();

      emptyViewModel.cancel();

      expect(emptyViewModel.workDuration).toBe(0);
      expect(emptyViewModel.restDuration).toBe(0);
    });

    it('Should revert multiple changes', () => {
      viewModel.workDuration = 30;
      viewModel.restDuration = 10;
      viewModel.workDuration = 40;

      viewModel.cancel();

      expect(viewModel.workDuration).toBe(25);
      expect(viewModel.restDuration).toBe(5);
    });
  });

  describe('Validation Methods', () => {
    it('validateWorkDuration(25) should return true', () => {
      expect(viewModel.validateWorkDuration(25)).toBe(true);
    });

    it('validateWorkDuration(-1) should return false', () => {
      expect(viewModel.validateWorkDuration(-1)).toBe(false);
    });

    it('validateWorkDuration(0) should return false', () => {
      expect(viewModel.validateWorkDuration(0)).toBe(false);
    });

    it('validateWorkDuration(1.5) should return false (non-integer)', () => {
      expect(viewModel.validateWorkDuration(1.5)).toBe(false);
    });

    it('validateWorkDuration(120) should return true', () => {
      expect(viewModel.validateWorkDuration(120)).toBe(true);
    });

    it('validateRestDuration(5) should return true', () => {
      expect(viewModel.validateRestDuration(5)).toBe(true);
    });

    it('validateRestDuration(-1) should return false', () => {
      expect(viewModel.validateRestDuration(-1)).toBe(false);
    });

    it('validateRestDuration(0) should return false', () => {
      expect(viewModel.validateRestDuration(0)).toBe(false);
    });

    it('validateRestDuration(2.5) should return false (non-integer)', () => {
      expect(viewModel.validateRestDuration(2.5)).toBe(false);
    });

    it('validateRestDuration(60) should return true', () => {
      expect(viewModel.validateRestDuration(60)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('Should handle load() called multiple times', () => {
      const settings1 = TimerSettingsSchema.parse({ workDuration: 25, restDuration: 5 });
      const settings2 = TimerSettingsSchema.parse({ workDuration: 30, restDuration: 10 });

      viewModel.load(settings1);
      viewModel.workDuration = 50;

      viewModel.load(settings2);

      expect(viewModel.hasChanges).toBe(false);
      expect(viewModel.workDuration).toBe(30);
    });

    it('Should handle save() without load()', () => {
      viewModel.workDuration = 25;
      viewModel.restDuration = 5;

      const saved = viewModel.save();

      expect(saved.workDuration).toBe(25);
      expect(saved.restDuration).toBe(5);
    });

    it('Should handle cancel() after save()', () => {
      const settings = TimerSettingsSchema.parse({ workDuration: 25, restDuration: 5 });
      viewModel.load(settings);

      viewModel.workDuration = 30;
      viewModel.save();

      viewModel.workDuration = 40;
      viewModel.cancel();

      // Should revert to saved value (30), not original (25)
      expect(viewModel.workDuration).toBe(30);
    });
  });
});
