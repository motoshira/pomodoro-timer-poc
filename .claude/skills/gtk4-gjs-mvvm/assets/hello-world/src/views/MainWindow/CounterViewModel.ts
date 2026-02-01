import GObject from 'gi://GObject';
import {
  createInitialCounter,
  decrement as decrementModel,
  increment as incrementModel,
  reset as resetModel,
  type Counter,
} from '../../models/Counter';

class _CounterViewModel extends GObject.Object {
  private _model!: Counter;
  private _count!: number;

  _init(params?: Partial<GObject.Object.ConstructorProps>) {
    super._init(params);
    this._model = createInitialCounter();
    this._syncFromModel();
  }

  // Sync GObject property fields from model
  private _syncFromModel(): void {
    this._count = this._model.count;
  }

  // Getter for GObject property
  get count(): number {
    return this._count;
  }

  get displayText(): string {
    return `Count: ${this._count}`;
  }

  increment(): void {
    this._model = incrementModel(this._model);
    this._syncFromModel();
    this.notify('count');
    this.notify('display-text');
  }

  decrement(): void {
    this._model = decrementModel(this._model);
    this._syncFromModel();
    this.notify('count');
    this.notify('display-text');
  }

  reset(): void {
    this._model = resetModel(this._model);
    this._syncFromModel();
    this.notify('count');
    this.notify('display-text');
  }
}

const CounterViewModelClass = GObject.registerClass(
  {
    GTypeName: 'HelloWorldCounterViewModel',
    Properties: {
      count: GObject.ParamSpec.int(
        'count',
        'Count',
        'Current count value',
        GObject.ParamFlags.READABLE,
        -2147483648, // G_MININT32
        2147483647, // G_MAXINT32
        0,
      ),
      'display-text': GObject.ParamSpec.string(
        'display-text',
        'Display Text',
        'Formatted display text',
        GObject.ParamFlags.READABLE,
        'Count: 0',
      ),
    },
  },
  _CounterViewModel,
);

export type CounterViewModel = InstanceType<typeof CounterViewModelClass>;

export function createCounterViewModel(): CounterViewModel {
  return new CounterViewModelClass();
}

export { CounterViewModelClass };
