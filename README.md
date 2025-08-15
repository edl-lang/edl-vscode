# EDL Language Support for Visual Studio Code

Advanced syntax highlighting, IntelliSense autocompletion, and real-time linting for the EDL (Event Description Language) programming language.

## Features

### 🎨 Cyberpunk/Space Tech Themed Syntax Highlighting
- **EDL Cyberpunk Dark**: A vibrant dark theme with neon colors inspired by cyberpunk aesthetics
- **EDL Space Tech Light**: A clean light theme with space technology-inspired colors
- Unique colors for EDL-specific keywords, operators, and constructs

### 🧠 Intelligent IntelliSense
- Context-aware autocompletion for EDL keywords, functions, and variables
- Built-in function suggestions with parameter hints
- Event-specific completions and templates
- State machine transition suggestions

### 🔍 Real-time Linting
- Syntax error detection with quick fixes
- Semantic analysis for undefined events and invalid transitions
- Style warnings for code consistency
- Configurable linting rules

### ⚙️ Customizable Configuration
- Toggle IntelliSense and linting features
- Custom color palette overrides
- Configurable theme switching

## EDL Language Features

### Keywords
- **Event Management**: `event`, `trigger`, `emit`, `listen`
- **State Machines**: `state`, `transition`, `handler`
- **Control Flow**: `if`, `else`, `while`, `for`, `switch`
- **Modifiers**: `async`, `sync`, `parallel`, `sequential`, `priority`, `timeout`

### Built-in Functions
- `emit(event, data?)` - Emit events to the system
- `listen(event, handler)` - Listen for specific events
- `schedule(event, delay)` - Schedule future events
- `delay(milliseconds)` - Add execution delays
- `log()`, `debug()`, `error()`, `warn()`, `info()` - Logging functions

### Special Operators
- `->` - Event flow operator
- `=>` - Function arrow operator
- `<-` - Reverse flow operator
- `<=>` - Bidirectional flow operator
- `|>` - Pipe operator

## Installation

1. Open Visual Studio Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "EDL Language Support"
4. Click Install

## Usage

1. Create a new file with `.edl` extension
2. Start writing EDL code with full syntax highlighting
3. Use Ctrl+Space for IntelliSense suggestions
4. Hover over keywords and functions for documentation
5. View real-time linting feedback in the Problems panel

## Configuration

Access settings via File > Preferences > Settings, then search for "EDL":

\`\`\`json
{
  "edl.linting.enabled": true,
  "edl.intellisense.enabled": true,
  "edl.theme.customColors": {
    "keyword": "#ff0080",
    "function": "#8080ff"
  }
}
\`\`\`

## Commands

- `EDL: Validate File` - Manually validate the current EDL file

## Example EDL Code

\`\`\`edl
// Define an event
event user_login {
    user_id: string
    timestamp: int
    session_token: string
}

// Create a state machine
state authentication {
    idle -> authenticating on user_login
    authenticating -> authenticated on success
    authenticating -> failed on error
    failed -> idle on retry
}

// Event handler
handler handle_login(event: user_login) {
    log("User login attempt:", event.user_id)
    
    if (validate_credentials(event)) {
        emit(authentication_success, event)
        transition_to(authenticated)
    } else {
        emit(authentication_failed, event)
        transition_to(failed)
    }
}

// Listen for events
listen(user_login, handle_login)

// Schedule cleanup
schedule(cleanup_sessions, delay: 3600) // 1 hour
