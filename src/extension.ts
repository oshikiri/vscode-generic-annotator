import * as vscode from "vscode";
import { getDiagnostics } from "./diagnostics";
import { applyDecorations, createDecorations } from "./decoration";
import { createCommand } from "./annotator_adapter";
import { getMatchingAnnotatorConfigurations } from "./configuration";

const TEXT_CHANGE_DEBOUNCE_MS = 300;

type RefreshState = {
  timer: NodeJS.Timeout | undefined;
  generation: number;
};

const refreshStates = new Map<string, RefreshState>();

export function activate(context: vscode.ExtensionContext) {
  const diagnostics =
    vscode.languages.createDiagnosticCollection("Generic Annotator");
  context.subscriptions.push(diagnostics);
  subscribeToDocumentChanges(context, diagnostics);
}

function subscribeToDocumentChanges(
  context: vscode.ExtensionContext,
  diagnostics: vscode.DiagnosticCollection,
): void {
  if (vscode.window.activeTextEditor) {
    scheduleDocumentRefresh(
      vscode.window.activeTextEditor.document,
      diagnostics,
      0,
    );
  }

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        scheduleDocumentRefresh(editor.document, diagnostics, 0);
      }
    }),
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((e) =>
      scheduleDocumentRefresh(e.document, diagnostics, TEXT_CHANGE_DEBOUNCE_MS),
    ),
  );

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument((doc) => {
      scheduleDocumentRefresh(doc, diagnostics, 0);
    }),
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration("genericAnnotator")) {
        for (const editor of vscode.window.visibleTextEditors) {
          scheduleDocumentRefresh(editor.document, diagnostics, 0);
        }
      }
    }),
  );

  context.subscriptions.push(
    vscode.workspace.onWillSaveTextDocument((event) => {
      scheduleDocumentRefresh(event.document, diagnostics, 0);
    }),
  );

  context.subscriptions.push(
    vscode.workspace.onDidCloseTextDocument((doc) => {
      const key = doc.uri.toString();
      const state = refreshStates.get(key);
      if (state?.timer) {
        clearTimeout(state.timer);
      }
      refreshStates.delete(key);
      diagnostics.delete(doc.uri);
    }),
  );
}

function scheduleDocumentRefresh(
  doc: vscode.TextDocument,
  diagnostics: vscode.DiagnosticCollection,
  delayMs: number,
): void {
  const key = doc.uri.toString();
  const state = refreshStates.get(key) ?? {
    timer: undefined,
    generation: 0,
  };

  if (state.timer) {
    clearTimeout(state.timer);
  }

  state.generation += 1;
  const generation = state.generation;
  state.timer = setTimeout(() => {
    state.timer = undefined;
    void refreshDocument(doc, diagnostics, generation);
  }, delayMs);

  refreshStates.set(key, state);
}

async function refreshDocument(
  doc: vscode.TextDocument,
  diagnosticCollection: vscode.DiagnosticCollection,
  generation: number,
): Promise<void> {
  const diagnostics = await createDiagnostics(doc);
  if (!isLatestRefresh(doc.uri, generation)) {
    return;
  }
  diagnosticCollection.set(doc.uri, diagnostics);

  const editor = getVisibleEditor(doc.uri);
  if (!editor) {
    return;
  }

  const decorations = await createDecorations(editor);
  if (!isLatestRefresh(doc.uri, generation)) {
    return;
  }
  applyDecorations(editor, decorations);
}

function isLatestRefresh(uri: vscode.Uri, generation: number): boolean {
  return refreshStates.get(uri.toString())?.generation === generation;
}

function getVisibleEditor(uri: vscode.Uri): vscode.TextEditor | undefined {
  return vscode.window.visibleTextEditors.find(
    (editor) => editor.document.uri.toString() === uri.toString(),
  );
}

// https://github.com/microsoft/vscode-extension-samples/blob/133fa26af64ba8760559c5a06299953673d60763/code-actions-sample/src/diagnostics.ts
async function createDiagnostics(
  doc: vscode.TextDocument,
): Promise<vscode.Diagnostic[]> {
  const docUri = doc?.uri;
  const docPath = docUri?.fsPath;
  if (docPath === undefined) {
    return [];
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
    diagnostics = diagnostics.concat(
      await getDiagnostics(command, docPath, workspacePath),
    );
  }
  return diagnostics;
}
