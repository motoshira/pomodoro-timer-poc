# GJS/GTK Patterns Reference

This guide covers common patterns for working with GJS (GNOME JavaScript) and GTK 4.0 in TypeScript.

## Table of Contents

- [GObject Registration](#gobject-registration)
- [Property Binding](#property-binding)
- [Signal Handling](#signal-handling)
- [Template Binding](#template-binding)
- [GResource Usage](#gresource-usage)
- [Common GTK Widgets](#common-gtk-widgets)
- [GTK UI Files](#gtk-ui-files)
- [Type Definitions](#type-definitions)

## GObject Registration

### Basic Pattern

```typescript
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';

class _MyWidget extends Gtk.Box {
  _init(params?: Partial<Gtk.Box.ConstructorProps>) {
    super._init(params);
    // Initialization code
  }
}

export const MyWidget = GObject.registerClass(
  {
    GTypeName: 'MyAppMyWidget',
  },
  _MyWidget,
);

export type MyWidget = InstanceType<typeof MyWidget>;
```

### With Properties

```typescript
class _MyViewModel extends GObject.Object {
  private _count!: number;

  _init(params?: Partial<GObject.Object.ConstructorProps>) {
    super._init(params);
    this._count = 0;
  }

  get count(): number {
    return this._count;
  }

  increment(): void {
    this._count++;
    this.notify('count');
  }
}

const MyViewModelClass = GObject.registerClass(
  {
    GTypeName: 'MyAppMyViewModel',
    Properties: {
      count: GObject.ParamSpec.int(
        'count',
        'Count',
        'Current count value',
        GObject.ParamFlags.READABLE,
        -2147483648, // G_MININT32
        2147483647,  // G_MAXINT32
        0,           // default value
      ),
    },
  },
  _MyViewModel,
);

export type MyViewModel = InstanceType<typeof MyViewModelClass>;
export { MyViewModelClass };
```

### With Signals

```typescript
class _MyModel extends GObject.Object {
  emitCustomSignal(value: string): void {
    this.emit('custom-event', value);
  }
}

const MyModelClass = GObject.registerClass(
  {
    GTypeName: 'MyAppMyModel',
    Signals: {
      'custom-event': {
        param_types: [GObject.TYPE_STRING],
      },
    },
  },
  _MyModel,
);

export type MyModel = InstanceType<typeof MyModelClass>;
export { MyModelClass };
```

### With Template

```typescript
class _MainWindow extends Gtk.ApplicationWindow {
  private _button!: Gtk.Button;
  private _label!: Gtk.Label;

  _init(params?: Partial<Gtk.ApplicationWindow.ConstructorProps>) {
    super._init(params);

    this._button.connect('clicked', () => {
      this._label.set_label('Button clicked!');
    });
  }
}

export const MainWindow = GObject.registerClass(
  {
    GTypeName: 'MyAppMainWindow',
    Template: 'resource:///org/example/myapp/ui/MainWindow.ui',
    InternalChildren: ['button', 'label'],
  },
  _MainWindow,
);
```

## Property Binding

### One-Way Binding (Source → Target)

```typescript
import GObject from 'gi://GObject';

// Bind ViewModel property to Label text
viewModel.bind_property(
  'display-text',           // Source property (kebab-case)
  label,                    // Target object
  'label',                  // Target property
  GObject.BindingFlags.SYNC_CREATE, // Sync immediately
);
```

### Bidirectional Binding

```typescript
// Bind ViewModel property to Entry text (both ways)
viewModel.bind_property(
  'text-value',
  entry,
  'text',
  GObject.BindingFlags.SYNC_CREATE | GObject.BindingFlags.BIDIRECTIONAL,
);
```

### Binding Flags

```typescript
// SYNC_CREATE: Sync target to source immediately
GObject.BindingFlags.SYNC_CREATE

// BIDIRECTIONAL: Changes propagate both ways
GObject.BindingFlags.BIDIRECTIONAL

// INVERT_BOOLEAN: Invert boolean values
GObject.BindingFlags.INVERT_BOOLEAN

// Combination
GObject.BindingFlags.SYNC_CREATE | GObject.BindingFlags.BIDIRECTIONAL
```

### Transform Functions

```typescript
// Bind with transformation
viewModel.bind_property_full(
  'count',
  label,
  'label',
  GObject.BindingFlags.SYNC_CREATE,
  (_binding, sourceValue) => {
    // Transform source value
    return [true, `Count: ${sourceValue}`];
  },
  null, // No reverse transform (one-way binding)
);
```

### Unbinding

```typescript
const binding = viewModel.bind_property(
  'count',
  label,
  'label',
  GObject.BindingFlags.SYNC_CREATE,
);

// Later: unbind
binding.unbind();
```

## Signal Handling

### Connecting Signals

```typescript
// Basic connection
button.connect('clicked', () => {
  console.log('Button clicked!');
});

// With parameters
entry.connect('changed', (entry) => {
  console.log('New text:', entry.get_text());
});

// With context
button.connect('clicked', this._onButtonClicked.bind(this));
```

### Signal Handler IDs

```typescript
class _MyWidget extends Gtk.Box {
  private _handlerId: number | null = null;

  _init() {
    super._init();

    this._handlerId = button.connect('clicked', () => {
      console.log('Clicked');
    });
  }

  disconnect(): void {
    if (this._handlerId !== null) {
      button.disconnect(this._handlerId);
      this._handlerId = null;
    }
  }
}
```

### Blocking Signals

```typescript
const handlerId = entry.connect('changed', (entry) => {
  console.log('Changed');
});

// Temporarily block
GObject.signal_handler_block(entry, handlerId);
entry.set_text('New text'); // Won't trigger signal
GObject.signal_handler_unblock(entry, handlerId);
```

### Emitting Custom Signals

```typescript
// Define signal in registerClass
const MyClass = GObject.registerClass(
  {
    Signals: {
      'value-changed': {
        param_types: [GObject.TYPE_INT],
      },
    },
  },
  _MyClass,
);

// Emit signal
this.emit('value-changed', newValue);

// Connect to signal
myObject.connect('value-changed', (_obj, value) => {
  console.log('Value changed to:', value);
});
```

### Common GTK Signals

```typescript
// Button
button.connect('clicked', () => {});

// Entry
entry.connect('changed', (entry) => {});
entry.connect('activate', (entry) => {}); // Enter key pressed

// Window
window.connect('close-request', () => {
  // Clean up
  return false; // Allow close
});

// Application
app.connect('activate', () => {});
app.connect('shutdown', () => {});

// CheckButton/ToggleButton
checkButton.connect('toggled', (button) => {
  console.log('Active:', button.get_active());
});
```

## Template Binding

### Loading Template

```typescript
const MainWindow = GObject.registerClass(
  {
    GTypeName: 'MyAppMainWindow',
    Template: 'resource:///org/example/myapp/ui/MainWindow.ui',
    InternalChildren: ['myButton', 'myLabel'],
  },
  _MainWindow,
);
```

### Accessing InternalChildren

```typescript
class _MainWindow extends Gtk.ApplicationWindow {
  // Use ! to indicate they're initialized by GObject
  private _myButton!: Gtk.Button;
  private _myLabel!: Gtk.Label;

  _init(params?: Partial<Gtk.ApplicationWindow.ConstructorProps>) {
    super._init(params);

    // InternalChildren are available after super._init()
    this._myButton.set_label('Click me');
    this._myLabel.set_label('Hello');
  }
}
```

### Child Widgets (Not InternalChildren)

```typescript
class _MyBox extends Gtk.Box {
  _init() {
    super._init({ orientation: Gtk.Orientation.VERTICAL });

    // Create and add child widgets
    const label = new Gtk.Label({ label: 'Hello' });
    this.append(label);

    const button = new Gtk.Button({ label: 'Click' });
    this.append(button);
  }
}
```

## GResource Usage

### Registering Resources

```typescript
import Gio from 'gi://Gio';

// Load and register GResource
const resource = Gio.Resource.load('resources/myapp.gresource');
Gio.resources_register(resource);
```

### Accessing Resource Files

```typescript
// Load UI template (done automatically by Template property)
const builder = Gtk.Builder.new_from_resource(
  '/org/example/myapp/ui/MainWindow.ui'
);

// Load CSS
const cssProvider = new Gtk.CssProvider();
cssProvider.load_from_resource('/org/example/myapp/style.css');

// Load icon
const pixbuf = GdkPixbuf.Pixbuf.new_from_resource(
  '/org/example/myapp/icons/app-icon.png'
);
```

### GResource XML Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<gresources>
  <gresource prefix="/org/example/myapp">
    <file>ui/MainWindow.ui</file>
    <file>ui/SettingsDialog.ui</file>
    <file>style.css</file>
    <file>icons/app-icon.png</file>
  </gresource>
</gresources>
```

### Compiling GResource

```bash
glib-compile-resources \
  --sourcedir=resources \
  --target=resources/myapp.gresource \
  resources/myapp.gresource.xml
```

## Common GTK Widgets

### Application

```typescript
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';

const app = new Gtk.Application({
  application_id: 'org.example.MyApp',
  flags: Gio.ApplicationFlags.DEFAULT_FLAGS,
});

app.connect('activate', () => {
  const window = new Gtk.ApplicationWindow({ application: app });
  window.present();
});

app.run([]);
```

### Window

```typescript
const window = new Gtk.ApplicationWindow({
  application: app,
  title: 'My Window',
  default_width: 800,
  default_height: 600,
});

window.present();
```

### Box Layout

```typescript
const box = new Gtk.Box({
  orientation: Gtk.Orientation.VERTICAL,
  spacing: 12,
  margin_top: 24,
  margin_bottom: 24,
  margin_start: 24,
  margin_end: 24,
});

box.append(new Gtk.Label({ label: 'First' }));
box.append(new Gtk.Label({ label: 'Second' }));
```

### Button

```typescript
const button = new Gtk.Button({
  label: 'Click Me',
});

button.connect('clicked', () => {
  console.log('Clicked!');
});

// Add CSS class
button.add_css_class('suggested-action');
button.add_css_class('destructive-action');
```

### Label

```typescript
const label = new Gtk.Label({
  label: 'Hello World',
  halign: Gtk.Align.CENTER,
  valign: Gtk.Align.CENTER,
});

// Update label
label.set_label('New text');

// Use markup
label.set_markup('<b>Bold</b> and <i>italic</i>');
```

### Entry

```typescript
const entry = new Gtk.Entry({
  placeholder_text: 'Enter text...',
});

entry.connect('changed', (entry) => {
  console.log('Text:', entry.get_text());
});

entry.connect('activate', (entry) => {
  console.log('Enter pressed:', entry.get_text());
});
```

### SpinButton

```typescript
const spinButton = new Gtk.SpinButton({
  adjustment: new Gtk.Adjustment({
    lower: 0,
    upper: 100,
    step_increment: 1,
    page_increment: 10,
    value: 50,
  }),
});

spinButton.connect('value-changed', (spin) => {
  console.log('Value:', spin.get_value());
});
```

### CheckButton

```typescript
const checkButton = new Gtk.CheckButton({
  label: 'Enable feature',
  active: true,
});

checkButton.connect('toggled', (button) => {
  console.log('Checked:', button.get_active());
});
```

### Dialog

```typescript
const dialog = new Gtk.Dialog({
  title: 'Confirm Action',
  transient_for: parentWindow,
  modal: true,
});

dialog.add_button('Cancel', Gtk.ResponseType.CANCEL);
dialog.add_button('OK', Gtk.ResponseType.OK);

const contentArea = dialog.get_content_area();
contentArea.append(new Gtk.Label({ label: 'Are you sure?' }));

dialog.connect('response', (_dialog, response) => {
  if (response === Gtk.ResponseType.OK) {
    console.log('OK clicked');
  }
  dialog.close();
});

dialog.show();
```

## GTK UI Files

### Basic Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<interface>
  <template class="MyAppMainWindow" parent="GtkApplicationWindow">
    <property name="title">My Application</property>
    <property name="default-width">800</property>
    <property name="default-height">600</property>
    <child>
      <!-- Child widgets -->
    </child>
  </template>
</interface>
```

### Common Properties

```xml
<object class="GtkBox">
  <!-- Layout -->
  <property name="orientation">vertical</property>
  <property name="spacing">12</property>

  <!-- Margins -->
  <property name="margin-top">24</property>
  <property name="margin-bottom">24</property>
  <property name="margin-start">24</property>
  <property name="margin-end">24</property>

  <!-- Alignment -->
  <property name="halign">center</property>
  <property name="valign">center</property>

  <!-- Expansion -->
  <property name="hexpand">1</property>
  <property name="vexpand">1</property>

  <!-- Size -->
  <property name="width-request">200</property>
  <property name="height-request">100</property>
</object>
```

### CSS Classes

```xml
<object class="GtkButton" id="myButton">
  <property name="label">Click Me</property>
  <style>
    <class name="suggested-action"/>
  </style>
</object>

<object class="GtkLabel">
  <property name="label">Large Text</property>
  <style>
    <class name="title-1"/>
  </style>
</object>
```

### Common CSS Classes

```
title-1, title-2, title-3, title-4  - Heading styles
suggested-action                     - Blue button
destructive-action                   - Red button
flat                                 - Borderless button
circular                             - Circular button
```

### Nested Widgets

```xml
<child>
  <object class="GtkBox">
    <property name="orientation">horizontal</property>
    <property name="spacing">8</property>
    <child>
      <object class="GtkButton" id="button1">
        <property name="label">Button 1</property>
      </object>
    </child>
    <child>
      <object class="GtkButton" id="button2">
        <property name="label">Button 2</property>
      </object>
    </child>
  </object>
</child>
```

### Validation

```bash
# Validate UI file
gtk4-builder-tool validate MainWindow.ui

# Simplify UI file (remove redundant properties)
gtk4-builder-tool simplify --replace MainWindow.ui

# Preview UI file
gtk4-builder-tool preview MainWindow.ui
```

## Type Definitions

### Importing GJS Modules

```typescript
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
```

### Type Annotations

```typescript
// Widget types
const button: Gtk.Button = new Gtk.Button({ label: 'Click' });
const label: Gtk.Label = new Gtk.Label({ label: 'Text' });
const box: Gtk.Box = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL });

// Constructor props
const windowParams: Partial<Gtk.ApplicationWindow.ConstructorProps> = {
  title: 'My Window',
  default_width: 800,
};
const window = new Gtk.ApplicationWindow(windowParams);

// Signal handlers
button.connect('clicked', (btn: Gtk.Button) => {
  console.log('Button clicked');
});
```

### Common Types

```typescript
// Enums
Gtk.Orientation.VERTICAL
Gtk.Orientation.HORIZONTAL

Gtk.Align.FILL
Gtk.Align.START
Gtk.Align.END
Gtk.Align.CENTER

Gtk.ResponseType.OK
Gtk.ResponseType.CANCEL
Gtk.ResponseType.YES
Gtk.ResponseType.NO

GObject.BindingFlags.SYNC_CREATE
GObject.BindingFlags.BIDIRECTIONAL

// Flags
Gio.ApplicationFlags.DEFAULT_FLAGS
GObject.ParamFlags.READABLE
GObject.ParamFlags.READWRITE
```

### Installing Type Definitions

```bash
npm install --save-dev @girs/gjs @girs/gtk-4.0 @girs/gio-2.0 @girs/glib-2.0
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "types": [
      "@girs/gjs",
      "@girs/gtk-4.0",
      "@girs/gio-2.0",
      "@girs/glib-2.0"
    ]
  }
}
```

## Summary

This reference covers the most common patterns for GTK4+GJS development:

- **GObject**: Use `registerClass` with GTypeName, Properties, Signals
- **Properties**: Define with `ParamSpec`, notify on changes
- **Binding**: Use `bind_property` for reactive UI updates
- **Signals**: Connect with `connect`, disconnect with `disconnect`
- **Templates**: Load from GResource, access via InternalChildren
- **UI Files**: Write in XML, validate with gtk4-builder-tool
- **Types**: Import from `gi://` modules, use @girs/* type definitions

For more details, see the [GNOME Developer Documentation](https://docs.gtk.org/).
