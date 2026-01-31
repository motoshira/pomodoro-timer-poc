import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import type { SettingsViewModel } from '../viewModels/SettingsViewModel';
import type { TimerSettings } from '../models/TimerSettings';

export const SettingsDialog = GObject.registerClass(
  {
    GTypeName: 'PomodoroSettingsDialog',
    Template: 'resource:///org/example/pomodoro/ui/SettingsDialog.ui',
    InternalChildren: ['workDurationInput', 'restDurationInput', 'saveButton', 'cancelButton'],
  },
  class SettingsDialog extends Gtk.Dialog {
    private _workDurationInput!: Gtk.SpinButton;
    private _restDurationInput!: Gtk.SpinButton;
    private _saveButton!: Gtk.Button;
    private _cancelButton!: Gtk.Button;
    private _viewModel: SettingsViewModel | null = null;

    _init(params?: Partial<Gtk.Dialog.ConstructorProps>) {
      super._init(params);

      // Connect button signals
      this._saveButton.connect('clicked', () => this._onSaveClicked());
      this._cancelButton.connect('clicked', () => this._onCancelClicked());
    }

    bindViewModel(viewModel: SettingsViewModel): void {
      this._viewModel = viewModel;

      // Bind ViewModel properties to SpinButton values
      viewModel.bind_property(
        'work-duration',
        this._workDurationInput,
        'value',
        GObject.BindingFlags.BIDIRECTIONAL | GObject.BindingFlags.SYNC_CREATE,
      );

      viewModel.bind_property(
        'rest-duration',
        this._restDurationInput,
        'value',
        GObject.BindingFlags.BIDIRECTIONAL | GObject.BindingFlags.SYNC_CREATE,
      );
    }

    loadSettings(settings: TimerSettings): void {
      this._viewModel?.load(settings);
    }

    private _onSaveClicked(): void {
      if (!this._viewModel) return;

      try {
        const settings = this._viewModel.save();
        // Signal that settings were saved successfully
        this.response(Gtk.ResponseType.OK);
        // Pass the settings via data property
        (this as any)._savedSettings = settings;
      } catch (error) {
        console.error('Failed to save settings:', error);
        // Optionally show an error dialog
      }
    }

    private _onCancelClicked(): void {
      this._viewModel?.cancel();
      this.response(Gtk.ResponseType.CANCEL);
    }

    getSavedSettings(): TimerSettings | null {
      return (this as any)._savedSettings || null;
    }
  },
);
