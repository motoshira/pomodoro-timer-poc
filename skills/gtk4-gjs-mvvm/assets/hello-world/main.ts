import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';
import { MainWindow } from './src/views/MainWindow/MainWindow';
import { createCounterViewModel } from './src/views/MainWindow/CounterViewModel';

const application = new Gtk.Application({
  application_id: 'org.example.HelloWorld',
  flags: Gio.ApplicationFlags.DEFAULT_FLAGS,
});

application.connect('activate', () => {
  // Create ViewModel
  const viewModel = createCounterViewModel();

  // Create and bind View
  const window = new MainWindow({ application });
  window.bindViewModel(viewModel);

  window.present();
});

application.run([]);
