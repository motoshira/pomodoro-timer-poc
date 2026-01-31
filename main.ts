import Gio from 'gi://Gio?version=2.0';
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk?version=4.0';

class PomodoroApplication extends Gtk.Application {
  static {
    GObject.registerClass(PomodoroApplication);
  }

  constructor() {
    super({
      application_id: 'com.example.pomodoro',
      flags: Gio.ApplicationFlags.DEFAULT_FLAGS,
    });
  }

  vfunc_activate(): void {
    // Create the main application window
    const window = new Gtk.ApplicationWindow({
      application: this,
      title: 'Pomodoro Timer',
      default_width: 400,
      default_height: 300,
    });

    // Create a label with "Hello World" text
    const label = new Gtk.Label({
      label: 'Hello World',
    });

    // Set the label as the window's child (GTK 4.0 API)
    window.set_child(label);

    // Show the window
    window.present();
  }
}

// Create and run the application
const app = new PomodoroApplication();
app.run([]);
