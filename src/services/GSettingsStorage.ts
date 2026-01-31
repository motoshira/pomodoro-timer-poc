import Gio from 'gi://Gio';
import {
  createDefaultSettings,
  type TimerSettings,
  TimerSettingsSchema,
} from '../models/TimerSettings';
import type { ISettingsStorage } from './ISettingsStorage';

export class GSettingsStorage implements ISettingsStorage {
  private settings: Gio.Settings;

  constructor() {
    this.settings = new Gio.Settings({
      schema_id: 'org.example.pomodoro',
    });
  }

  load(): TimerSettings {
    const workDuration = this.settings.get_int('work-duration');
    const restDuration = this.settings.get_int('rest-duration');

    // Validate loaded settings
    return TimerSettingsSchema.parse({
      workDuration,
      restDuration,
    });
  }

  save(settings: TimerSettings): void {
    // Validate before saving
    const validated = TimerSettingsSchema.parse(settings);

    this.settings.set_int('work-duration', validated.workDuration);
    this.settings.set_int('rest-duration', validated.restDuration);
  }

  getDefaultSettings(): TimerSettings {
    return createDefaultSettings();
  }
}
