import { describe, expect, jest, test } from "@jest/globals";

const outputChannel = {
  appendLine: jest.fn(),
};

jest.mock(
  "vscode",
  () => ({
    window: {
      createOutputChannel: jest.fn(() => outputChannel),
    },
  }),
  { virtual: true },
);

import { getMatchingAnnotatorConfigurations } from "../configuration";

describe("getMatchingAnnotatorConfigurations", () => {
  test("returns configs with a matching pathRegex", () => {
    const configs = getMatchingAnnotatorConfigurations(
      [
        {
          pathRegex: "\\.ledger$",
          commandTemplate: "node script.js ${path}",
        },
        {
          pathRegex: "\\.md$",
          commandTemplate: "node markdown.js ${path}",
        },
      ],
      "/workspace/example.ledger",
    );

    expect(configs).toEqual([
      {
        pathRegex: "\\.ledger$",
        commandTemplate: "node script.js ${path}",
      },
    ]);
  });

  test("ignores invalid pathRegex and logs the error", () => {
    const configs = getMatchingAnnotatorConfigurations(
      [
        {
          pathRegex: "[",
          commandTemplate: "node script.js ${path}",
        },
      ],
      "/workspace/example.ledger",
    );

    expect(configs).toEqual([]);
    expect(outputChannel.appendLine).toHaveBeenCalledWith(
      "Invalid genericAnnotator.annotatorConfigurations pathRegex: [",
    );
  });
});
