import * as vscode from "vscode";

import { execPromise } from "./exec";
import { outputChannel } from "./vscode_helper";

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
  const workspacePath = folder?.uri?.path;

  const currentFilePath = docUri.path;
  if (currentFilePath === undefined || workspacePath === undefined) {
    outputChannel.appendLine("path is undefined");
    return [];
  }

  const decorations: vscode.DecorationOptions[] = [];

  for (const config of settings?.annotatorConfigurations) {
    if (currentFilePath.match(new RegExp(config.pathRegex))) {
      const command = config.commandTemplate
        ?.replace("${path}", currentFilePath)
        .replace("${workspaceRoot}", workspacePath);
      if (!command) {
        continue;
      }

      const commandResult = await execPromise(command);
      for (const line of commandResult.split("\n")) {
        if (line.length === 0) {
          continue;
        }
        const obj = JSON.parse(line);
        if (obj["type"] === "decoration") {
          decorations.push(obj as vscode.DecorationOptions);
        }
      }
    }
  }

  return decorations;
}
