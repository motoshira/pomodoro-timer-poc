import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import type { TimerViewModel } from '../viewModels/TimerViewModel';

export const MainWindow = GObject.registerClass(
  {
    GTypeName: 'PomodoroMainWindow',
    Template: 'resource:///org/example/pomodoro/ui/MainWindow.ui',
    InternalChildren: [
      'timeLabel',
      'modeLabel',
      'modeIcon',
      'startStopButton',
      'skipButton',
      'resetButton',
      'settingsButton',
    ],
  },
  class MainWindow extends Gtk.ApplicationWindow {
    private _timeLabel!: Gtk.Label;
    private _modeLabel!: Gtk.Label;
    private _modeIcon!: Gtk.Image;
    private _startStopButton!: Gtk.Button;
    private _skipButton!: Gtk.Button;
    private _resetButton!: Gtk.Button;
    private _settingsButton!: Gtk.Button;
    private _viewModel: TimerViewModel | null = null;

    _init(params?: Partial<Gtk.ApplicationWindow.ConstructorProps>) {
      super._init(params);

      // Connect button signals
      this._startStopButton.connect('clicked', () => this._onStartStopClicked());
      this._skipButton.connect('clicked', () => this._onSkipClicked());
      this._resetButton.connect('clicked', () => this._onResetClicked());
      this._settingsButton.connect('clicked', () => this._onSettingsClicked());
    }

    bindViewModel(viewModel: TimerViewModel): void {
      this._viewModel = viewModel;

      // Bind properties from ViewModel to UI widgets
      viewModel.bind_property(
        'display-time',
        this._timeLabel,
        'label',
        GObject.BindingFlags.SYNC_CREATE,
      );

      viewModel.bind_property(
        'mode-label',
        this._modeLabel,
        'label',
        GObject.BindingFlags.SYNC_CREATE,
      );

      viewModel.bind_property(
        'mode-icon',
        this._modeIcon,
        'icon-name',
        GObject.BindingFlags.SYNC_CREATE,
      );

      viewModel.bind_property(
        'start-stop-label',
        this._startStopButton,
        'label',
        GObject.BindingFlags.SYNC_CREATE,
      );
    }

    private _onStartStopClicked(): void {
      if (!this._viewModel) return;

      if (this._viewModel.state === 'STOPPED') {
        this._viewModel.start();
      } else {
        this._viewModel.stop();
      }
    }

    private _onSkipClicked(): void {
      this._viewModel?.skip();
    }

    private _onResetClicked(): void {
      this._viewModel?.reset();
    }

    private _onSettingsClicked(): void {
      // TODO: Open SettingsDialog (will be implemented in 5.5)
      console.log('Settings button clicked');
    }
  },
);
