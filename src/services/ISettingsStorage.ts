import type { TimerSettings } from '../models/TimerSettings';

export interface ISettingsStorage {
  load(): TimerSettings;
  save(settings: TimerSettings): void;
  getDefaultSettings(): TimerSettings;
}
