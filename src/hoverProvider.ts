import * as vscode from "vscode"

export class EDLHoverProvider implements vscode.HoverProvider {
  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
  ): vscode.ProviderResult<vscode.Hover> {
    const range = document.getWordRangeAtPosition(position)
    if (!range) {
      return
    }

    const word = document.getText(range)
    const hoverContent = this.getHoverContent(word)

    if (hoverContent) {
      return new vscode.Hover(hoverContent, range)
    }
  }

  private getHoverContent(word: string): vscode.MarkdownString | undefined {
    const documentation: { [key: string]: string } = {
      // Keywords
      event:
        "**event** - Defines an event that can be triggered in the system\n\n```edl\nevent user_login {\n    user_id: string\n    timestamp: int\n}\n```",
      trigger: "**trigger** - Activates an event or condition\n\n```edl\ntrigger user_login_event\n```",
      state: "**state** - Defines a state in a state machine\n\n```edl\nstate idle {\n    on_event -> active\n}\n```",
      transition:
        "**transition** - Defines a transition between states\n\n```edl\ntransition idle -> active on user_input\n```",

      // Built-in functions
      emit: '**emit(event, data?)** - Emits an event to the system\n\n```edl\nemit(user_login, { user_id: "123" })\n```',
      listen:
        "**listen(event, handler)** - Listens for specific events\n\n```edl\nlisten(user_login, handle_login)\n```",
      schedule:
        "**schedule(event, delay)** - Schedules an event for future execution\n\n```edl\nschedule(cleanup_event, 3600) // 1 hour delay\n```",
      delay:
        "**delay(milliseconds)** - Delays execution for a specified time\n\n```edl\ndelay(1000) // Wait 1 second\n```",

      // Types
      Event: "**Event** - Base type for all events in the system\n\nContains timestamp, type, and data properties",
      State: "**State** - Represents a state in a state machine\n\nContains name, transitions, and handlers",
      Handler:
        "**Handler** - Function type for event handlers\n\n```edl\nHandler<EventType> = (event: EventType) -> void\n```",

      // Operators
      "->": "**->** - Event flow operator\n\nDefines the flow from one event to another",
      "=>": "**=>** - Function arrow operator\n\nUsed in lambda expressions and function definitions",
      "<-": "**<-** - Reverse flow operator\n\nDefines reverse event flow or data binding",
      "|>": "**|>** - Pipe operator\n\nPipes data through a series of transformations",
    }

    if (documentation[word]) {
      return new vscode.MarkdownString(documentation[word])
    }

    return undefined
  }
}
