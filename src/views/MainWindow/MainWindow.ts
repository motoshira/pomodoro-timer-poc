import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import type { ISettingsStorage } from '../../services/ISettingsStorage';
import { SettingsDialog } from '../SettingsDialog/SettingsDialog';
import { createSettingsViewModel } from '../SettingsDialog/SettingsViewModel';
import type { TimerViewModel } from './TimerViewModel';

class _MainWindow extends Gtk.ApplicationWindow {
  private _timeLabel!: Gtk.Label;
  private _modeLabel!: Gtk.Label;
  private _modeIcon!: Gtk.Image;
  private _startStopButton!: Gtk.Button;
  private _skipButton!: Gtk.Button;
  private _resetButton!: Gtk.Button;
  private _settingsButton!: Gtk.Button;
  private _viewModel: TimerViewModel | null = null;
  private storage: ISettingsStorage | null = null;

  _init(params?: Partial<Gtk.ApplicationWindow.ConstructorProps>) {
    super._init(params);

    // Connect button signals
    this._startStopButton.connect('clicked', () => this._onStartStopClicked());
    this._skipButton.connect('clicked', () => this._onSkipClicked());
    this._resetButton.connect('clicked', () => this._onResetClicked());
    this._settingsButton.connect('clicked', () => this._onSettingsClicked());
  }

  bindViewModel(viewModel: TimerViewModel, storage: ISettingsStorage): void {
    this._viewModel = viewModel;
    this.storage = storage;

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
    this._viewModel?.toggleStartStop();
  }

  private _onSkipClicked(): void {
    this._viewModel?.skip();
  }

  private _onResetClicked(): void {
    this._viewModel?.reset();
  }

  private _onSettingsClicked(): void {
    if (!this._viewModel || !this.storage) return;

    // Create SettingsViewModel with storage and current settings
    const settingsViewModel = createSettingsViewModel(this.storage, this._viewModel.settings);

    // Connect to settings-changed signal BEFORE creating dialog
    const signalId = settingsViewModel.connect('settings-changed', () => {
      // Reload settings from storage and update TimerViewModel
      const updatedSettings = this.storage!.load();
      this._viewModel?.updateSettings(updatedSettings);
    });

    // Create and show dialog
    const dialog = new SettingsDialog({ transient_for: this, modal: true });
    dialog.bindViewModel(settingsViewModel);

    // Handle dialog close to clean up signal connection
    dialog.connect('close-request', () => {
      settingsViewModel.disconnect(signalId);
      return false; // Allow dialog to close
    });

    dialog.show();
  }
}

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
  _MainWindow,
);
