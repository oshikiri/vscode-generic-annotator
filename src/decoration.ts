import * as vscode from "vscode";

import { execPromise } from "./exec";

const decorationType = vscode.window.createTextEditorDecorationType({});

export async function setDecorations(
  _ctx: vscode.ExtensionContext,
  editor: vscode.TextEditor | undefined
): Promise<void> {
  if (!editor) {
    return;
  }
  const decorations = await createDecorations(editor);
  editor.setDecorations(decorationType, decorations);
}

export async function createDecorations(
  editor: vscode.TextEditor
): Promise<vscode.DecorationOptions[]> {
  const docUri = editor.document.uri;
  const settings = vscode.workspace.getConfiguration(
    "genericAnnotator",
    docUri
  );

  const folder = vscode.workspace.getWorkspaceFolder(docUri);
  const workspacePath = folder.uri.path;

  const currentFilePath = docUri.path;
  if (currentFilePath === undefined) {
    return;
  }

  const decorations: vscode.DecorationOptions[] = [];

  for (const config of settings?.annotatorConfigurations) {
    if (
      config.type === "decoration" &&
      currentFilePath.match(new RegExp(config.pathRegex))
    ) {
      const command = config.commandTemplate
        ?.replace("${path}", currentFilePath)
        .replace("${workspacePath}", workspacePath);
      if (!command) {
        continue;
      }

      const commandResult = await execPromise(command);
      for (const line of commandResult.split("\n")) {
        if (line.length === 0) {
          continue;
        }
        const obj = JSON.parse(line);
        decorations.push(obj as vscode.DecorationOptions);
      }
    }
  }

  return decorations;
}