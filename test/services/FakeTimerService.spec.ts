import { FakeTimerService } from './FakeTimerService';

describe('FakeTimerService', () => {
  let service: FakeTimerService;

  beforeEach(() => {
    service = new FakeTimerService();
  });

  describe('startTimer()', () => {
    it('Should return numeric timer ID', () => {
      const timerId = service.startTimer(() => true, 1000);
      expect(typeof timerId).toBe('number');
      expect(timerId).toBeGreaterThan(0);
    });

    it('Should return unique IDs for multiple timers', () => {
      const id1 = service.startTimer(() => true, 1000);
      const id2 = service.startTimer(() => true, 1000);
      const id3 = service.startTimer(() => true, 1000);

      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
    });
  });

  describe('tick() method', () => {
    it('Should manually invoke callback', () => {
      let callCount = 0;
      const timerId = service.startTimer(() => {
        callCount++;
        return true;
      }, 1000);

      service.tick(timerId);
      expect(callCount).toBe(1);

      service.tick(timerId);
      expect(callCount).toBe(2);
    });

    it('Should respect callback return value (true = continue)', () => {
      let tickCount = 0;
      const timerId = service.startTimer(() => {
        tickCount++;
        return tickCount < 3; // Stop after 3 ticks
      }, 1000);

      const continue1 = service.tick(timerId);
      expect(continue1).toBe(true);
      expect(service.isActive(timerId)).toBe(true);

      const continue2 = service.tick(timerId);
      expect(continue2).toBe(true);
      expect(service.isActive(timerId)).toBe(true);

      const continue3 = service.tick(timerId);
      expect(continue3).toBe(false);
      expect(service.isActive(timerId)).toBe(false);
    });

    it('Should return false for non-existent timer ID', () => {
      const result = service.tick(999);
      expect(result).toBe(false);
    });
  });

  describe('stopTimer()', () => {
    it('Should prevent future ticks', () => {
      let callCount = 0;
      const timerId = service.startTimer(() => {
        callCount++;
        return true;
      }, 1000);

      service.tick(timerId);
      expect(callCount).toBe(1);

      service.stopTimer(timerId);

      service.tick(timerId);
      expect(callCount).toBe(1); // Should not increment
    });

    it('Should mark timer as inactive', () => {
      const timerId = service.startTimer(() => true, 1000);
      expect(service.isActive(timerId)).toBe(true);

      service.stopTimer(timerId);
      expect(service.isActive(timerId)).toBe(false);
    });

    it('Should handle stopping non-existent timer gracefully', () => {
      expect(() => service.stopTimer(999)).not.toThrow();
    });
  });

  describe('Multiple concurrent timers', () => {
    it('Should support multiple concurrent timers', () => {
      let count1 = 0;
      let count2 = 0;

      const timer1 = service.startTimer(() => {
        count1++;
        return true;
      }, 1000);

      const timer2 = service.startTimer(() => {
        count2++;
        return true;
      }, 1000);

      service.tick(timer1);
      expect(count1).toBe(1);
      expect(count2).toBe(0);

      service.tick(timer2);
      expect(count1).toBe(1);
      expect(count2).toBe(1);

      service.tick(timer1);
      expect(count1).toBe(2);
      expect(count2).toBe(1);
    });
  });

  describe('Test helpers', () => {
    it('isActive() should return true for active timer', () => {
      const timerId = service.startTimer(() => true, 1000);
      expect(service.isActive(timerId)).toBe(true);
    });

    it('isActive() should return false for stopped timer', () => {
      const timerId = service.startTimer(() => true, 1000);
      service.stopTimer(timerId);
      expect(service.isActive(timerId)).toBe(false);
    });

    it('getActiveCount() should return number of active timers', () => {
      expect(service.getActiveCount()).toBe(0);

      const timer1 = service.startTimer(() => true, 1000);
      expect(service.getActiveCount()).toBe(1);

      const timer2 = service.startTimer(() => true, 1000);
      expect(service.getActiveCount()).toBe(2);

      service.stopTimer(timer1);
      expect(service.getActiveCount()).toBe(1);

      service.stopTimer(timer2);
      expect(service.getActiveCount()).toBe(0);
    });

    it('reset() should clear all timers', () => {
      service.startTimer(() => true, 1000);
      service.startTimer(() => true, 1000);
      service.startTimer(() => true, 1000);

      expect(service.getActiveCount()).toBe(3);

      service.reset();

      expect(service.getActiveCount()).toBe(0);
    });
  });
});
