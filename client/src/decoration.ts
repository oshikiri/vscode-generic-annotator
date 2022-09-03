import * as vscode from "vscode";

const decorationType = vscode.window.createTextEditorDecorationType({});

export async function setDecorations(
  ctx: vscode.ExtensionContext,
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
  console.log(editor.document.uri);
  const decorations: vscode.DecorationOptions[] = [
    {
      renderOptions: {
        before: {
          contentText: "hogehoge",
          color: "grey",
          margin: "5px",
        },
      },
      range: {
        start: {
          line: 1,
          character: 1,
        },
        end: {
          line: 1,
          character: 3,
        },
      } as vscode.Range,
    },
  ];
  return decorations;
}
