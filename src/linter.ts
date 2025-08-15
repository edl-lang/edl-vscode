import * as vscode from "vscode"

export class EDLLinter implements vscode.Disposable {
  private diagnosticCollection: vscode.DiagnosticCollection
  private disposables: vscode.Disposable[] = []

  constructor() {
    this.diagnosticCollection = vscode.languages.createDiagnosticCollection("edl")

    // Watch for document changes
    this.disposables.push(
      vscode.workspace.onDidChangeTextDocument((event) => {
        if (event.document.languageId === "edl") {
          this.validateDocument(event.document)
        }
      }),
    )

    // Watch for document open
    this.disposables.push(
      vscode.workspace.onDidOpenTextDocument((document) => {
        if (document.languageId === "edl") {
          this.validateDocument(document)
        }
      }),
    )

    // Validate all open EDL documents
    vscode.workspace.textDocuments.forEach((document) => {
      if (document.languageId === "edl") {
        this.validateDocument(document)
      }
    })
  }

  public validateDocument(document: vscode.TextDocument): void {
    const config = vscode.workspace.getConfiguration("edl")
    if (!config.get("linting.enabled", true)) {
      return
    }

    const diagnostics: vscode.Diagnostic[] = []
    const text = document.getText()
    const lines = text.split("\n")

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const lineNumber = i

      // Check for syntax errors
      this.checkSyntaxErrors(line, lineNumber, diagnostics)

      // Check for semantic errors
      this.checkSemanticErrors(line, lineNumber, diagnostics)

      // Check for style warnings
      this.checkStyleWarnings(line, lineNumber, diagnostics)
    }

    this.diagnosticCollection.set(document.uri, diagnostics)
  }

  private checkSyntaxErrors(line: string, lineNumber: number, diagnostics: vscode.Diagnostic[]): void {
    // Check for unmatched brackets
    const openBrackets = (line.match(/\{/g) || []).length
    const closeBrackets = (line.match(/\}/g) || []).length

    if (openBrackets > closeBrackets) {
      const range = new vscode.Range(lineNumber, line.length - 1, lineNumber, line.length)
      const diagnostic = new vscode.Diagnostic(range, "Missing closing bracket", vscode.DiagnosticSeverity.Error)
      diagnostic.code = "missing-bracket"
      diagnostics.push(diagnostic)
    }

    // Check for invalid event syntax
    const eventMatch = line.match(/event\s+(\w+)/)
    if (eventMatch) {
      const eventName = eventMatch[1]
      if (!/^[a-z][a-z0-9_]*$/.test(eventName)) {
        const startPos = line.indexOf(eventName)
        const range = new vscode.Range(lineNumber, startPos, lineNumber, startPos + eventName.length)
        const diagnostic = new vscode.Diagnostic(
          range,
          "Event names should be lowercase with underscores",
          vscode.DiagnosticSeverity.Error,
        )
        diagnostic.code = "invalid-event-name"
        diagnostics.push(diagnostic)
      }
    }

    // Check for missing semicolons (if required)
    if (line.trim().match(/^(emit|listen|schedule|delay|cancel)\s*$$[^)]*$$\s*$/) && !line.includes(";")) {
      const range = new vscode.Range(lineNumber, line.length - 1, lineNumber, line.length)
      const diagnostic = new vscode.Diagnostic(range, "Missing semicolon", vscode.DiagnosticSeverity.Warning)
      diagnostic.code = "missing-semicolon"
      diagnostics.push(diagnostic)
    }
  }

  private checkSemanticErrors(line: string, lineNumber: number, diagnostics: vscode.Diagnostic[]): void {
    // Check for undefined event references
    const emitMatch = line.match(/emit\s*\(\s*(\w+)/)
    if (emitMatch) {
      const eventName = emitMatch[1]
      // In a real implementation, you'd check against a symbol table
      // For now, we'll just check for common naming patterns
      if (eventName.includes("undefined") || eventName === "null") {
        const startPos = line.indexOf(eventName)
        const range = new vscode.Range(lineNumber, startPos, lineNumber, startPos + eventName.length)
        const diagnostic = new vscode.Diagnostic(
          range,
          `Undefined event: ${eventName}`,
          vscode.DiagnosticSeverity.Error,
        )
        diagnostic.code = "undefined-event"
        diagnostics.push(diagnostic)
      }
    }

    // Check for invalid state transitions
    const transitionMatch = line.match(/(\w+)\s*->\s*(\w+)/)
    if (transitionMatch) {
      const fromState = transitionMatch[1]
      const toState = transitionMatch[2]

      if (fromState === toState) {
        const range = new vscode.Range(lineNumber, 0, lineNumber, line.length)
        const diagnostic = new vscode.Diagnostic(
          range,
          "Self-transitions should be explicit",
          vscode.DiagnosticSeverity.Warning,
        )
        diagnostic.code = "self-transition"
        diagnostics.push(diagnostic)
      }
    }
  }

  private checkStyleWarnings(line: string, lineNumber: number, diagnostics: vscode.Diagnostic[]): void {
    // Check for long lines
    if (line.length > 120) {
      const range = new vscode.Range(lineNumber, 120, lineNumber, line.length)
      const diagnostic = new vscode.Diagnostic(
        range,
        "Line too long (>120 characters)",
        vscode.DiagnosticSeverity.Information,
      )
      diagnostic.code = "line-too-long"
      diagnostics.push(diagnostic)
    }

    // Check for inconsistent indentation
    const leadingWhitespace = line.match(/^(\s*)/)?.[1] || ""
    if (leadingWhitespace.includes("\t") && leadingWhitespace.includes(" ")) {
      const range = new vscode.Range(lineNumber, 0, lineNumber, leadingWhitespace.length)
      const diagnostic = new vscode.Diagnostic(
        range,
        "Mixed tabs and spaces for indentation",
        vscode.DiagnosticSeverity.Warning,
      )
      diagnostic.code = "mixed-indentation"
      diagnostics.push(diagnostic)
    }

    // Check for trailing whitespace
    if (line.match(/\s+$/)) {
      const trimmedLength = line.trimEnd().length
      const range = new vscode.Range(lineNumber, trimmedLength, lineNumber, line.length)
      const diagnostic = new vscode.Diagnostic(range, "Trailing whitespace", vscode.DiagnosticSeverity.Information)
      diagnostic.code = "trailing-whitespace"
      diagnostics.push(diagnostic)
    }
  }

  public updateConfiguration(): void {
    // Re-validate all open documents when configuration changes
    vscode.workspace.textDocuments.forEach((document) => {
      if (document.languageId === "edl") {
        this.validateDocument(document)
      }
    })
  }

  dispose(): void {
    this.diagnosticCollection.dispose()
    this.disposables.forEach((d) => d.dispose())
  }
}
