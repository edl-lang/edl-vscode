import * as vscode from "vscode"
import { EDLCompletionProvider } from "./completionProvider"
import { EDLLinter } from "./linter"
import { EDLHoverProvider } from "./hoverProvider"

export function activate(context: vscode.ExtensionContext) {
  console.log("EDL Language Support extension is now active!")

  // Register completion provider
  const completionProvider = new EDLCompletionProvider()
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      "edl",
      completionProvider,
      ".", // Trigger on dot
      "-", // Trigger on arrow operators
      ">",
    ),
  )

  // Register hover provider
  const hoverProvider = new EDLHoverProvider()
  context.subscriptions.push(vscode.languages.registerHoverProvider("edl", hoverProvider))

  // Initialize linter
  const linter = new EDLLinter()
  context.subscriptions.push(linter)

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand("edl.validateFile", () => {
      const editor = vscode.window.activeTextEditor
      if (editor && editor.document.languageId === "edl") {
        linter.validateDocument(editor.document)
        vscode.window.showInformationMessage("EDL file validation completed!")
      } else {
        vscode.window.showWarningMessage("Please open an EDL file to validate.")
      }
    }),
  )

  // Watch for configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration("edl")) {
        // Reload linter settings
        linter.updateConfiguration()
      }
    }),
  )
}

export function deactivate() {
  console.log("EDL Language Support extension is now deactivated.")
}
