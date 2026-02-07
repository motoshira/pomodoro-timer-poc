import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import type { CounterViewModel } from './CounterViewModel';

class _MainWindow extends Gtk.ApplicationWindow {
  private _countLabel!: Gtk.Label;
  private _incrementButton!: Gtk.Button;
  private _decrementButton!: Gtk.Button;
  private _resetButton!: Gtk.Button;
  private _viewModel: CounterViewModel | null = null;

  _init(params?: Partial<Gtk.ApplicationWindow.ConstructorProps>) {
    super._init(params);

    // Connect button signals
    this._incrementButton.connect('clicked', () => this._onIncrementClicked());
    this._decrementButton.connect('clicked', () => this._onDecrementClicked());
    this._resetButton.connect('clicked', () => this._onResetClicked());
  }

  bindViewModel(viewModel: CounterViewModel): void {
    this._viewModel = viewModel;

    // Bind properties from ViewModel to UI widgets
    viewModel.bind_property(
      'display-text',
      this._countLabel,
      'label',
      GObject.BindingFlags.SYNC_CREATE,
    );
  }

  private _onIncrementClicked(): void {
    this._viewModel?.increment();
  }

  private _onDecrementClicked(): void {
    this._viewModel?.decrement();
  }

  private _onResetClicked(): void {
    this._viewModel?.reset();
  }
}

export const MainWindow = GObject.registerClass(
  {
    GTypeName: 'HelloWorldMainWindow',
    Template: 'resource:///org/example/helloworld/ui/MainWindow.ui',
    InternalChildren: ['countLabel', 'incrementButton', 'decrementButton', 'resetButton'],
  },
  _MainWindow,
);
