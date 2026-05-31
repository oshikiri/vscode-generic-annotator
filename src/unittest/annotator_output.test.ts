import {
  parseDecorationOutput,
  parseDiagnosticOutput,
} from "../annotator_output";
import { describe, expect, test } from "@jest/globals";

describe("parseDiagnosticOutput", () => {
  test("returns valid diagnostics", () => {
    const result = parseDiagnosticOutput(
      JSON.stringify({
        type: "diagnostic",
        message: "message",
        severity: 1,
        source: "test",
        range: {
          start: { line: 0, character: 1 },
          end: { line: 0, character: 2 },
        },
      }),
    );

    expect(result.errors).toEqual([]);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].message).toBe("message");
  });

  test("ignores non-diagnostic output", () => {
    const result = parseDiagnosticOutput(
      JSON.stringify({
        type: "decoration",
        range: {
          start: { line: 0, character: 0 },
          end: { line: 0, character: 1 },
        },
      }),
    );

    expect(result).toEqual({ items: [], errors: [] });
  });

  test("keeps valid diagnostics when another line has invalid JSON", () => {
    const result = parseDiagnosticOutput(
      [
        "{",
        JSON.stringify({
          type: "diagnostic",
          message: "valid",
          range: {
            start: { line: 0, character: 0 },
            end: { line: 0, character: 1 },
          },
        }),
      ].join("\n"),
    );

    expect(result.items).toHaveLength(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toMatchObject({
      line: 1,
      content: "{",
    });
  });

  test("rejects diagnostics without a message", () => {
    const result = parseDiagnosticOutput(
      JSON.stringify({
        type: "diagnostic",
        range: {
          start: { line: 0, character: 0 },
          end: { line: 0, character: 1 },
        },
      }),
    );

    expect(result.items).toEqual([]);
    expect(result.errors[0].message).toBe(
      "diagnostic.message must be a string",
    );
  });

  test("rejects diagnostics with invalid ranges", () => {
    const result = parseDiagnosticOutput(
      JSON.stringify({
        type: "diagnostic",
        message: "message",
        range: {
          start: { line: -1, character: 0 },
          end: { line: 0, character: 1 },
        },
      }),
    );

    expect(result.items).toEqual([]);
    expect(result.errors[0].message).toBe("diagnostic.range is invalid");
  });
});

describe("parseDecorationOutput", () => {
  test("returns valid decorations", () => {
    const result = parseDecorationOutput(
      JSON.stringify({
        type: "decoration",
        range: {
          start: { line: 0, character: 0 },
          end: { line: 0, character: 1 },
        },
        renderOptions: {
          after: {
            contentText: "hint",
          },
        },
      }),
    );

    expect(result.errors).toEqual([]);
    expect(result.items).toHaveLength(1);
  });

  test("ignores non-decoration output", () => {
    const result = parseDecorationOutput(
      JSON.stringify({
        type: "diagnostic",
        message: "message",
        range: {
          start: { line: 0, character: 0 },
          end: { line: 0, character: 1 },
        },
      }),
    );

    expect(result).toEqual({ items: [], errors: [] });
  });

  test("keeps valid decorations when another line has invalid JSON", () => {
    const result = parseDecorationOutput(
      [
        JSON.stringify({
          type: "decoration",
          range: {
            start: { line: 0, character: 0 },
            end: { line: 0, character: 1 },
          },
        }),
        "{",
      ].join("\n"),
    );

    expect(result.items).toHaveLength(1);
    expect(result.errors).toHaveLength(1);
  });

  test("rejects decorations with invalid ranges", () => {
    const result = parseDecorationOutput(
      JSON.stringify({
        type: "decoration",
        range: {
          start: { line: 0, character: 0 },
          end: { line: 0, character: -1 },
        },
      }),
    );

    expect(result.items).toEqual([]);
    expect(result.errors[0].message).toBe("decoration.range is invalid");
  });
});
