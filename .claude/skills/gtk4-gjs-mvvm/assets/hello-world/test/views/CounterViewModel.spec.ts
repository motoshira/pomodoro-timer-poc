import { createCounterViewModel, type CounterViewModel } from '../../src/views/MainWindow/CounterViewModel';

describe('CounterViewModel', () => {
  let viewModel: CounterViewModel;

  beforeEach(() => {
    viewModel = createCounterViewModel();
  });

  describe('Initialization', () => {
    it('Should initialize with count 0', () => {
      expect(viewModel.count).toBe(0);
    });

    it('Should initialize with correct display text', () => {
      expect(viewModel.displayText).toBe('Count: 0');
    });
  });

  describe('increment()', () => {
    it('Should increment count by 1', () => {
      viewModel.increment();
      expect(viewModel.count).toBe(1);
    });

    it('Should update display text', () => {
      viewModel.increment();
      expect(viewModel.displayText).toBe('Count: 1');
    });

    it('Should emit property notifications', () => {
      const countSpy = jasmine.createSpy('count-notify');
      const displayTextSpy = jasmine.createSpy('display-text-notify');

      viewModel.connect('notify::count', countSpy);
      viewModel.connect('notify::display-text', displayTextSpy);

      viewModel.increment();

      expect(countSpy).toHaveBeenCalled();
      expect(displayTextSpy).toHaveBeenCalled();
    });

    it('Should handle multiple increments', () => {
      viewModel.increment();
      viewModel.increment();
      viewModel.increment();
      expect(viewModel.count).toBe(3);
    });
  });

  describe('decrement()', () => {
    it('Should decrement count by 1', () => {
      viewModel.decrement();
      expect(viewModel.count).toBe(-1);
    });

    it('Should update display text', () => {
      viewModel.decrement();
      expect(viewModel.displayText).toBe('Count: -1');
    });

    it('Should emit property notifications', () => {
      const countSpy = jasmine.createSpy('count-notify');
      const displayTextSpy = jasmine.createSpy('display-text-notify');

      viewModel.connect('notify::count', countSpy);
      viewModel.connect('notify::display-text', displayTextSpy);

      viewModel.decrement();

      expect(countSpy).toHaveBeenCalled();
      expect(displayTextSpy).toHaveBeenCalled();
    });
  });

  describe('reset()', () => {
    it('Should reset count to 0', () => {
      viewModel.increment();
      viewModel.increment();
      viewModel.reset();
      expect(viewModel.count).toBe(0);
    });

    it('Should update display text', () => {
      viewModel.increment();
      viewModel.reset();
      expect(viewModel.displayText).toBe('Count: 0');
    });

    it('Should emit property notifications', () => {
      const countSpy = jasmine.createSpy('count-notify');
      const displayTextSpy = jasmine.createSpy('display-text-notify');

      viewModel.increment();

      viewModel.connect('notify::count', countSpy);
      viewModel.connect('notify::display-text', displayTextSpy);

      viewModel.reset();

      expect(countSpy).toHaveBeenCalled();
      expect(displayTextSpy).toHaveBeenCalled();
    });
  });

  describe('Integration', () => {
    it('Should handle increment/decrement/reset sequence', () => {
      viewModel.increment();
      viewModel.increment();
      expect(viewModel.count).toBe(2);

      viewModel.decrement();
      expect(viewModel.count).toBe(1);

      viewModel.reset();
      expect(viewModel.count).toBe(0);
    });
  });
});
