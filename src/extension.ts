import * as vscode from "vscode";
import { getDiagnostics } from "./diagnostics";
import { setDecorations } from "./decoration";

export function activate(context: vscode.ExtensionContext) {
  // Diagnostics
  const diagnostics =
    vscode.languages.createDiagnosticCollection("diagnostics");
  context.subscriptions.push(diagnostics);
  subscribeToDocumentChanges(context, diagnostics);

  // Inlay hints
  vscode.workspace.onWillSaveTextDocument((event) => {
    const openEditor = vscode.window.visibleTextEditors.find(
      (editor) => editor.document.uri === event.document.uri
    );
    setDecorations(context, openEditor);
  });
}

// https://github.com/microsoft/vscode-extension-samples/blob/133fa26af64ba8760559c5a06299953673d60763/code-actions-sample/src/diagnostics.ts
async function refreshDiagnostics(
  doc: vscode.TextDocument,
  diagnosticCollection: vscode.DiagnosticCollection
): Promise<void> {
  const docUri = doc?.uri;
  const path = docUri?.path;
  if (path === undefined) {
    return;
  }

  const folder = vscode.workspace.getWorkspaceFolder(docUri);
  const workspacePath = folder?.uri?.path || ".";

  let diagnostics: vscode.Diagnostic[] = [];
  const settings = vscode.workspace.getConfiguration(
    "genericAnnotator",
    docUri
  );
  for (const config of settings?.annotatorConfigurations) {
    if (path.match(new RegExp(config.pathRegex))) {
      const command = config.commandTemplate
        ?.replace("${path}", path)
        .replace("${workspacePath}", workspacePath);
      if (command) {
        diagnostics = diagnostics.concat(await getDiagnostics(command));
      }
    }
  }
  diagnosticCollection.set(docUri, diagnostics);
}

function subscribeToDocumentChanges(
  context: vscode.ExtensionContext,
  diagnostics: vscode.DiagnosticCollection
): void {
  if (vscode.window.activeTextEditor) {
    refreshDiagnostics(vscode.window.activeTextEditor.document, diagnostics);
  }

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        refreshDiagnostics(editor.document, diagnostics);
      }
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((e) =>
      refreshDiagnostics(e.document, diagnostics)
    )
  );

  context.subscriptions.push(
    vscode.workspace.onDidCloseTextDocument((doc) =>
      diagnostics.delete(doc.uri)
    )
  );
}
