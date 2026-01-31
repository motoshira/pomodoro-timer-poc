# Requirements Document

## Project Overview

A Pomodoro Timer desktop application built with GTK and GJS, following the MVVM architecture pattern. This application helps users manage their time using the Pomodoro Technique with alternating work and rest periods.

## Functional Requirements

### 1. Timer Modes

The application supports two timer modes that alternate automatically:

- **Work Mode**: A countdown timer for focused work sessions (default: 25 minutes)
- **Rest Mode**: A countdown timer for break periods (default: 5 minutes)

**Behavior**:
- When a timer reaches 0, it automatically transitions to the next mode
- Transition pattern: Work → Rest → Work → Rest...

### 2. User Interface Layout

#### Timer Display (Upper Area)

The main display area (top portion of the window) shows:
- **Current remaining time**: Countdown display in MM:SS format
- **Current mode indicator**: Displays either "Work" or "Rest"

#### Control Buttons (Lower Area)

Three control buttons arranged horizontally at the bottom:

1. **Start/Stop Button**
   - Starts the countdown when stopped
   - Pauses the countdown when running
   - Button label toggles between "Start" and "Stop"

2. **Skip Button**
   - Discards the current countdown state
   - Immediately transitions to the next mode
   - Available regardless of timer state (running or stopped)

3. **Reset Button**
   - Resets the current timer to its initial duration
   - Stops the timer if it's running

#### Settings Button (Upper Right Corner)

- Display a settings icon (⚙)
- Opens the settings modal/dialog when clicked

### 3. Settings Configuration

The settings modal allows users to configure:

- **Work Duration**: Time length for work sessions (default: 25 minutes)
- **Rest Duration**: Time length for rest breaks (default: 5 minutes)

**Behavior**:
- Settings changes should apply to the next timer cycle
- Settings should persist across application sessions

## UI/UX Requirements

### Layout Structure

```
┌────────────────────────────────────────┐
│                          [⚙ Settings] │
│                                        │
│        Timer Display Area              │
│                                        │
│          MM:SS                         │
│          [Work/Rest]                   │
│                                        │
├────────────────────────────────────────┤
│   [Start/Stop]  [Skip]  [Reset]       │
└────────────────────────────────────────┘
```

### Timer State Transitions

1. **Automatic Transitions** (when timer reaches 0:00)
   - Work Mode → Rest Mode
   - Rest Mode → Work Mode

2. **Manual Skip** (Skip button)
   - Current Mode → Next Mode (regardless of remaining time)

3. **Reset**
   - Resets current timer to initial duration
   - Remains in current mode

### Button Behavior

- **Start/Stop**: Toggle button that changes label based on timer state
  - Stopped → "Start"
  - Running → "Stop"
- **Skip**: Always enabled, transitions to next mode
- **Reset**: Resets timer and stops countdown

### Settings Dialog

- Modal or popover dialog
- Input fields for Work and Rest durations
- Validation: Must accept positive integer values (in minutes)
- Save/Cancel buttons
- Changes take effect on next timer cycle (not immediately if timer is running)

## Technical Requirements

### Architecture

Follow MVVM pattern as defined in CLAUDE.md:

- **Models**: Define timer state, settings, and mode using Zod schemas
  - Location: `src/models/`
  - Pure TypeScript records generated from Zod schemas

- **ViewModels**: GObject classes for property binding with GTK
  - Location: `src/viewModels/`
  - Handle timer logic, state management, and business rules

- **Views**: GTK `.ui` template files
  - Location: `src/view/`
  - Define UI layout declaratively

### Technology Stack

- **GTK 4.0**: UI framework for native GNOME desktop integration
- **GJS**: JavaScript/TypeScript bindings for GTK and GLib
- **TypeScript**: Primary development language
- **Zod**: Schema validation for models
- **GLib.timeout_add**: Timer implementation (not JavaScript setTimeout)

### Key Implementation Considerations

1. **Timer Implementation**
   - Use `GLib.timeout_add` or `GLib.timeout_add_seconds` for timer intervals
   - Ensure accurate countdown even when window is not focused

2. **State Persistence**
   - Save settings to GSettings or local JSON file
   - Load settings on application startup

3. **Property Binding**
   - ViewModels should expose GObject properties
   - Bind ViewModel properties to View elements

4. **Notifications** (Future Enhancement)
   - Consider desktop notifications when timer completes
   - Audio notification option

## Non-Functional Requirements

### Performance
- UI should remain responsive during countdown
- Minimal CPU usage when idle

### Usability
- Intuitive button placement and labeling
- Clear visual distinction between Work and Rest modes
- Settings should be easy to access and modify

### Compatibility
- Target GNOME desktop environment
- GTK 4.0+ required
