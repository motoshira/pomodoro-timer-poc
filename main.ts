import Gio from 'gi://Gio?version=2.0';
import Gtk from 'gi://Gtk?version=4.0';
import { GLibTimerService } from './src/services/GLibTimerService';
import { GSettingsStorage } from './src/services/GSettingsStorage';
import { MainWindow } from './src/views/MainWindow/MainWindow';
import { createTimerViewModel } from './src/views/MainWindow/TimerViewModel';

const application = new Gtk.Application({
  application_id: 'org.example.pomodoro',
  flags: Gio.ApplicationFlags.DEFAULT_FLAGS,
});

application.connect('activate', () => {
  // Create services
  const timerService = new GLibTimerService();
  const storage = new GSettingsStorage();

  // Create ViewModel
  const viewModel = createTimerViewModel(timerService, storage);

  // Create and show window
  const window = new MainWindow({ application });
  window.bindViewModel(viewModel);
  window.present();
});

application.run([]);
