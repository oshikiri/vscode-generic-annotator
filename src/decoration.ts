import * as vscode from "vscode";

import { execPromise } from "./exec";
import { outputChannel } from "./vscode_helper";
import { createCommand } from "./annotator_adapter";

const decorationType = vscode.window.createTextEditorDecorationType({});

export async function setDecorations(
  _ctx: vscode.ExtensionContext,
  editor: vscode.TextEditor | undefined,
): Promise<void> {
  if (!editor) {
    return;
  }
  const decorations = await createDecorations(editor);
  if (decorations.length > 0) {
    editor.setDecorations(decorationType, decorations);
  }
}

export async function createDecorations(
  editor: vscode.TextEditor,
): Promise<vscode.DecorationOptions[]> {
  const docUri = editor.document.uri;
  const settings = vscode.workspace.getConfiguration(
    "genericAnnotator",
    docUri,
  );

  const folder = vscode.workspace.getWorkspaceFolder(docUri);
  const workspacePath = folder?.uri?.fsPath;

  const currentFilePath = docUri.fsPath;
  if (currentFilePath === undefined || workspacePath === undefined) {
    outputChannel.appendLine("path is undefined");
    return [];
  }

  let decorations: vscode.DecorationOptions[] = [];

  for (const config of settings?.annotatorConfigurations) {
    const isTarget = currentFilePath.match(new RegExp(config.pathRegex));
    if (isTarget && !!config.commandTemplate) {
      const command = createCommand(
        config.commandTemplate,
        currentFilePath,
        workspacePath,
      );
      decorations = decorations.concat(
        parseCommandResult(await execPromise(command)),
      );
    }
  }

  return decorations;
}

function parseCommandResult(commandResult: string): vscode.DecorationOptions[] {
  const decorations: vscode.DecorationOptions[] = [];

  for (const line of commandResult.split("\n")) {
    if (line.length === 0) {
      continue;
    }
    const obj = JSON.parse(line);
    if (obj["type"] === "decoration") {
      decorations.push(obj as vscode.DecorationOptions);
    }
  }

  return decorations;
}
