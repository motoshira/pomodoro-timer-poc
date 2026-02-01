import {
  createInitialCounter,
  decrement,
  increment,
  reset,
} from '../../src/models/Counter';

describe('Counter Model', () => {
  describe('createInitialCounter()', () => {
    it('Should create counter with count 0', () => {
      const counter = createInitialCounter();
      expect(counter.count).toBe(0);
    });
  });

  describe('increment()', () => {
    it('Should increment count by 1', () => {
      const counter = createInitialCounter();
      const result = increment(counter);
      expect(result.count).toBe(1);
    });

    it('Should not mutate original counter', () => {
      const counter = createInitialCounter();
      increment(counter);
      expect(counter.count).toBe(0);
    });

    it('Should handle multiple increments', () => {
      let counter = createInitialCounter();
      counter = increment(counter);
      counter = increment(counter);
      counter = increment(counter);
      expect(counter.count).toBe(3);
    });
  });

  describe('decrement()', () => {
    it('Should decrement count by 1', () => {
      const counter = createInitialCounter();
      const result = decrement(counter);
      expect(result.count).toBe(-1);
    });

    it('Should not mutate original counter', () => {
      const counter = createInitialCounter();
      decrement(counter);
      expect(counter.count).toBe(0);
    });

    it('Should handle negative numbers', () => {
      let counter = createInitialCounter();
      counter = decrement(counter);
      counter = decrement(counter);
      expect(counter.count).toBe(-2);
    });
  });

  describe('reset()', () => {
    it('Should reset count to 0', () => {
      let counter = createInitialCounter();
      counter = increment(counter);
      counter = increment(counter);
      const result = reset(counter);
      expect(result.count).toBe(0);
    });

    it('Should work with negative counts', () => {
      let counter = createInitialCounter();
      counter = decrement(counter);
      counter = decrement(counter);
      const result = reset(counter);
      expect(result.count).toBe(0);
    });
  });
});
