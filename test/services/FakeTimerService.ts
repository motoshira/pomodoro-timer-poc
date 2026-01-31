import type { ITimerService } from '../../src/services/ITimerService';

export class FakeTimerService implements ITimerService {
  private timers = new Map<number, () => boolean>();
  private nextId = 1;

  startTimer(callback: () => boolean, _intervalMs: number): number {
    const id = this.nextId++;
    this.timers.set(id, callback);
    return id;
  }

  stopTimer(timerId: number): void {
    this.timers.delete(timerId);
  }

  // Test helper: manually trigger tick for a timer
  tick(timerId: number): boolean {
    const callback = this.timers.get(timerId);
    if (!callback) return false;

    const shouldContinue = callback();
    if (!shouldContinue) {
      this.timers.delete(timerId);
    }
    return shouldContinue;
  }

  // Test helper: check if timer is active
  isActive(timerId: number): boolean {
    return this.timers.has(timerId);
  }

  // Test helper: get count of active timers
  getActiveCount(): number {
    return this.timers.size;
  }

  // Test helper: clear all timers
  reset(): void {
    this.timers.clear();
  }
}
