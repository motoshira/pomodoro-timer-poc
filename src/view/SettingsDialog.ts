import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import type { TimerSettings } from '../models/TimerSettings';
import type { SettingsViewModel } from '../viewModels/SettingsViewModel';

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
    private _savedSettings: TimerSettings | null = null;

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

        // Pass the settings via data property BEFORE emitting response
        this._savedSettings = settings;

        // Signal that settings were saved successfully
        this.response(Gtk.ResponseType.OK);
      } catch (error) {
        console.error('Failed to save settings:', error);
        const message = error instanceof Error ? error.message : 'Invalid settings values';
        this._showErrorDialog(message);
      }
    }

    private _onCancelClicked(): void {
      this._viewModel?.cancel();
      this.response(Gtk.ResponseType.CANCEL);
    }

    private _showErrorDialog(message: string): void {
      const errorDialog = new Gtk.MessageDialog({
        transient_for: this,
        modal: true,
        message_type: Gtk.MessageType.ERROR,
        buttons: Gtk.ButtonsType.OK,
        text: 'Settings Validation Failed',
        secondary_text: message,
      });

      errorDialog.connect('response', () => errorDialog.close());
      errorDialog.show();
    }

    getSavedSettings(): TimerSettings | null {
      return this._savedSettings;
    }
  },
);
