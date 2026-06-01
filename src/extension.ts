import * as vscode from "vscode";
import { getDiagnostics } from "./diagnostics";
import { setDecorations } from "./decoration";
import { createCommand } from "./annotator_adapter";
import { getMatchingAnnotatorConfigurations } from "./configuration";

export function activate(context: vscode.ExtensionContext) {
  // Diagnostics
  const diagnostics =
    vscode.languages.createDiagnosticCollection("diagnostics");
  context.subscriptions.push(diagnostics);
  subscribeToDocumentChanges(context, diagnostics);
  subscribeToDecorationChanges(context);
}

function subscribeToDocumentChanges(
  context: vscode.ExtensionContext,
  diagnostics: vscode.DiagnosticCollection,
): void {
  if (vscode.window.activeTextEditor) {
    refreshDiagnostics(vscode.window.activeTextEditor.document, diagnostics);
  }

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        refreshDiagnostics(editor.document, diagnostics);
      }
    }),
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((e) =>
      refreshDiagnostics(e.document, diagnostics),
    ),
  );

  context.subscriptions.push(
    vscode.workspace.onDidCloseTextDocument((doc) =>
      diagnostics.delete(doc.uri),
    ),
  );
}

function subscribeToDecorationChanges(context: vscode.ExtensionContext): void {
  // Runs once when the extension starts.
  refreshDecorations(context, vscode.window.activeTextEditor);

  context.subscriptions.push(
    // Fires when the active editor changes.
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      refreshDecorations(context, editor);
    }),
  );

  context.subscriptions.push(
    // Fires when VS Code opens a text document.
    vscode.workspace.onDidOpenTextDocument((doc) => {
      const openEditor = vscode.window.visibleTextEditors.find(
        (editor) => editor.document.uri === doc.uri,
      );
      refreshDecorations(context, openEditor);
    }),
  );

  context.subscriptions.push(
    // Fires after settings change.
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration("genericAnnotator")) {
        for (const editor of vscode.window.visibleTextEditors) {
          refreshDecorations(context, editor);
        }
      }
    }),
  );

  context.subscriptions.push(
    // Fires before VS Code saves a text document.
    vscode.workspace.onWillSaveTextDocument((event) => {
      const openEditor = vscode.window.visibleTextEditors.find(
        (editor) => editor.document.uri === event.document.uri,
      );
      refreshDecorations(context, openEditor);
    }),
  );
}

function refreshDecorations(
  context: vscode.ExtensionContext,
  editor: vscode.TextEditor | undefined,
): void {
  void setDecorations(context, editor);
}

// https://github.com/microsoft/vscode-extension-samples/blob/133fa26af64ba8760559c5a06299953673d60763/code-actions-sample/src/diagnostics.ts
async function refreshDiagnostics(
  doc: vscode.TextDocument,
  diagnosticCollection: vscode.DiagnosticCollection,
): Promise<void> {
  const docUri = doc?.uri;
  const docPath = docUri?.fsPath;
  if (docPath === undefined) {
    return;
  }

  const folder = vscode.workspace.getWorkspaceFolder(docUri);
  const workspacePath = folder?.uri?.fsPath || ".";

  let diagnostics: vscode.Diagnostic[] = [];
  const settings = vscode.workspace.getConfiguration(
    "genericAnnotator",
    docUri,
  );
  for (const config of getMatchingAnnotatorConfigurations(
    settings?.annotatorConfigurations,
    docPath,
  )) {
    const command = createCommand(
      config.commandTemplate,
      docPath,
      workspacePath,
    );
    diagnostics = diagnostics.concat(await getDiagnostics(command));
  }
  diagnosticCollection.set(docUri, diagnostics);
}
