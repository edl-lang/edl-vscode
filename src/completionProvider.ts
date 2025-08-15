import * as vscode from "vscode"

export class EDLCompletionProvider implements vscode.CompletionItemProvider {
  private keywords = [
    "event",
    "trigger",
    "action",
    "condition",
    "state",
    "transition",
    "handler",
    "listener",
    "async",
    "sync",
    "parallel",
    "sequential",
    "priority",
    "timeout",
    "if",
    "else",
    "while",
    "for",
    "do",
    "break",
    "continue",
    "return",
    "switch",
    "case",
    "default",
    "import",
    "export",
    "module",
    "namespace",
    "use",
    "include",
  ]

  private builtinFunctions = ["emit", "listen", "schedule", "delay", "cancel", "log", "debug", "error", "warn", "info"]

  private types = [
    "int",
    "float",
    "string",
    "bool",
    "void",
    "any",
    "Event",
    "State",
    "Transition",
    "Handler",
    "Timer",
    "Queue",
    "Channel",
  ]

  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
    context: vscode.CompletionContext,
  ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
    const config = vscode.workspace.getConfiguration("edl")
    if (!config.get("intellisense.enabled", true)) {
      return []
    }

    const completionItems: vscode.CompletionItem[] = []

    // Add keywords
    this.keywords.forEach((keyword) => {
      const item = new vscode.CompletionItem(keyword, vscode.CompletionItemKind.Keyword)
      item.detail = "EDL Keyword"
      item.documentation = this.getKeywordDocumentation(keyword)
      completionItems.push(item)
    })

    // Add built-in functions
    this.builtinFunctions.forEach((func) => {
      const item = new vscode.CompletionItem(func, vscode.CompletionItemKind.Function)
      item.detail = "EDL Built-in Function"
      item.documentation = this.getFunctionDocumentation(func)
      item.insertText = new vscode.SnippetString(`${func}($1)`)
      completionItems.push(item)
    })

    // Add types
    this.types.forEach((type) => {
      const item = new vscode.CompletionItem(type, vscode.CompletionItemKind.TypeParameter)
      item.detail = "EDL Type"
      item.documentation = this.getTypeDocumentation(type)
      completionItems.push(item)
    })

    // Add context-aware completions
    const lineText = document.lineAt(position).text
    const beforeCursor = lineText.substring(0, position.character)

    // Event-specific completions
    if (beforeCursor.includes("event")) {
      const eventItem = new vscode.CompletionItem("on_trigger", vscode.CompletionItemKind.Snippet)
      eventItem.insertText = new vscode.SnippetString("on_trigger(${1:condition}) {\n\t$2\n}")
      eventItem.detail = "Event Handler Template"
      completionItems.push(eventItem)
    }

    // State machine completions
    if (beforeCursor.includes("state")) {
      const stateItem = new vscode.CompletionItem("transition_to", vscode.CompletionItemKind.Snippet)
      stateItem.insertText = new vscode.SnippetString("transition_to(${1:target_state})")
      stateItem.detail = "State Transition"
      completionItems.push(stateItem)
    }

    return completionItems
  }

  private getKeywordDocumentation(keyword: string): vscode.MarkdownString {
    const docs: { [key: string]: string } = {
      event: "Defines an event that can be triggered in the system",
      trigger: "Activates an event or condition",
      action: "Defines an action to be executed",
      condition: "Specifies a condition for event handling",
      state: "Defines a state in a state machine",
      transition: "Defines a transition between states",
      handler: "Defines an event handler function",
      listener: "Creates an event listener",
      async: "Marks a function as asynchronous",
      sync: "Marks a function as synchronous",
      parallel: "Executes operations in parallel",
      sequential: "Executes operations sequentially",
    }

    return new vscode.MarkdownString(docs[keyword] || "EDL keyword")
  }

  private getFunctionDocumentation(func: string): vscode.MarkdownString {
    const docs: { [key: string]: string } = {
      emit: "Emits an event to the system",
      listen: "Listens for specific events",
      schedule: "Schedules an event for future execution",
      delay: "Delays execution for a specified time",
      cancel: "Cancels a scheduled event",
      log: "Logs a message",
      debug: "Logs a debug message",
      error: "Logs an error message",
      warn: "Logs a warning message",
      info: "Logs an info message",
    }

    return new vscode.MarkdownString(docs[func] || "EDL built-in function")
  }

  private getTypeDocumentation(type: string): vscode.MarkdownString {
    const docs: { [key: string]: string } = {
      Event: "Represents an event object",
      State: "Represents a state in a state machine",
      Transition: "Represents a state transition",
      Handler: "Represents an event handler",
      Timer: "Represents a timer object",
      Queue: "Represents an event queue",
      Channel: "Represents a communication channel",
    }

    return new vscode.MarkdownString(docs[type] || "EDL type")
  }
}
