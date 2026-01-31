export interface ITimerService {
  startTimer(callback: () => boolean, intervalMs: number): number;
  stopTimer(timerId: number): void;
}
