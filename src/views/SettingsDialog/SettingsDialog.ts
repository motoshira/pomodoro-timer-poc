import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import type { SettingsViewModel } from './SettingsViewModel';

class _SettingsDialog extends Gtk.Dialog {
  private _workDurationInput!: Gtk.SpinButton;
  private _restDurationInput!: Gtk.SpinButton;
  private _closeButton!: Gtk.Button;

  _init(params?: Partial<Gtk.Dialog.ConstructorProps>) {
    super._init(params);

    // Connect close button signal
    this._closeButton.connect('clicked', () => this.close());
  }

  bindViewModel(viewModel: SettingsViewModel): void {
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
}

export const SettingsDialog = GObject.registerClass(
  {
    GTypeName: 'PomodoroSettingsDialog',
    Template: 'resource:///org/example/pomodoro/ui/SettingsDialog.ui',
    InternalChildren: ['workDurationInput', 'restDurationInput', 'closeButton'],
  },
  _SettingsDialog,
);
