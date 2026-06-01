import { describe, expect, jest, test } from "@jest/globals";

const decorationType = {};

jest.mock(
  "vscode",
  () => ({
    window: {
      createOutputChannel: jest.fn(() => ({
        appendLine: jest.fn(),
      })),
      createTextEditorDecorationType: jest.fn(() => decorationType),
    },
  }),
  { virtual: true },
);

import { applyDecorations } from "../decoration";

describe("applyDecorations", () => {
  test("clears existing decorations when no decoration remains", () => {
    const editor = {
      setDecorations: jest.fn(),
    };

    applyDecorations(editor as never, []);

    expect(editor.setDecorations).toHaveBeenCalledWith(decorationType, []);
  });
});
