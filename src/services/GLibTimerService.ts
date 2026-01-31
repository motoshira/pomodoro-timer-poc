import GLib from 'gi://GLib';
import type { ITimerService } from './ITimerService';

export class GLibTimerService implements ITimerService {
  startTimer(callback: () => boolean, intervalMs: number): number {
    // GLib.timeout_add_seconds expects interval in seconds
    const intervalSeconds = Math.max(1, Math.round(intervalMs / 1000));

    return GLib.timeout_add_seconds(
      GLib.PRIORITY_DEFAULT,
      intervalSeconds,
      callback
    );
  }

  stopTimer(timerId: number): void {
    GLib.Source.remove(timerId);
  }
}
