import Gio from 'gi://Gio?version=2.0';
import GLib from 'gi://GLib';

// Load GResource bundle
const resourcePath = GLib.build_filenamev([
  GLib.get_current_dir(),
  'resources',
  'pomodoro.gresource',
]);
const resource = Gio.Resource.load(resourcePath);
Gio.resources_register(resource);

// Set up GSettings schema directory for development
GLib.setenv(
  'GSETTINGS_SCHEMA_DIR',
  GLib.build_filenamev([GLib.get_current_dir(), 'schemas']),
  true,
);
