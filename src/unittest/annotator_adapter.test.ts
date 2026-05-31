import { createCommand } from "../annotator_adapter";
import { describe, expect, test } from "@jest/globals";

describe("createCommand", () => {
  test("quotes path and workspace root placeholders", () => {
    const command = createCommand(
      "node ${workspaceRoot}/scripts/regex.js ${path}",
      "/tmp/work/file.txt",
      "/tmp/work",
    );

    expect(command).toBe(
      "node '/tmp/work'/scripts/regex.js '/tmp/work/file.txt'",
    );
  });

  test("preserves paths that contain spaces", () => {
    const command = createCommand(
      "node ${workspaceRoot}/scripts/regex.js ${path}",
      "/tmp/my work/file name.txt",
      "/tmp/my work",
    );

    expect(command).toBe(
      "node '/tmp/my work'/scripts/regex.js '/tmp/my work/file name.txt'",
    );
  });

  test("escapes single quotes in paths", () => {
    const command = createCommand(
      "node ${workspaceRoot}/scripts/regex.js ${path}",
      "/tmp/it's/file.txt",
      "/tmp/it's",
    );

    expect(command).toBe(
      "node '/tmp/it'\\''s'/scripts/regex.js '/tmp/it'\\''s/file.txt'",
    );
  });

  test("preserves dollar signs in paths", () => {
    const command = createCommand(
      "node ${workspaceRoot}/scripts/regex.js ${path}",
      "/tmp/$work/file.txt",
      "/tmp/$work",
    );

    expect(command).toBe(
      "node '/tmp/$work'/scripts/regex.js '/tmp/$work/file.txt'",
    );
  });

  test("replaces repeated placeholders", () => {
    const command = createCommand(
      "echo ${path} ${path} ${workspaceRoot} ${workspaceRoot}",
      "/tmp/work/file.txt",
      "/tmp/work",
    );

    expect(command).toBe(
      "echo '/tmp/work/file.txt' '/tmp/work/file.txt' '/tmp/work' '/tmp/work'",
    );
  });
});
