import type { DecorationOptions, Diagnostic } from "vscode";

export type AnnotatorOutputError = {
  line: number;
  message: string;
  content: string;
};

type AnnotatorOutputResult<T> = {
  items: T[];
  errors: AnnotatorOutputError[];
};

type RangeLike = {
  start: {
    line: number;
    character: number;
  };
  end: {
    line: number;
    character: number;
  };
};

export function parseDiagnosticOutput(
  commandResult: string,
): AnnotatorOutputResult<Diagnostic> {
  return parseAnnotatorOutput(commandResult, (obj, line, content) => {
    if (obj.type !== "diagnostic") {
      return undefined;
    }

    if (typeof obj.message !== "string") {
      return invalidOutput(
        line,
        content,
        "diagnostic.message must be a string",
      );
    }

    if (!isValidRange(obj.range)) {
      return invalidOutput(line, content, "diagnostic.range is invalid");
    }

    if (obj.severity !== undefined && !isIntegerInRange(obj.severity, 0, 3)) {
      return invalidOutput(
        line,
        content,
        "diagnostic.severity must be an integer from 0 to 3",
      );
    }

    if (obj.source !== undefined && typeof obj.source !== "string") {
      return invalidOutput(line, content, "diagnostic.source must be a string");
    }

    return obj as unknown as Diagnostic;
  });
}

export function parseDecorationOutput(
  commandResult: string,
): AnnotatorOutputResult<DecorationOptions> {
  return parseAnnotatorOutput(commandResult, (obj, line, content) => {
    if (obj.type !== "decoration") {
      return undefined;
    }

    if (!isValidRange(obj.range)) {
      return invalidOutput(line, content, "decoration.range is invalid");
    }

    if (obj.renderOptions !== undefined && !isRecord(obj.renderOptions)) {
      return invalidOutput(
        line,
        content,
        "decoration.renderOptions must be an object",
      );
    }

    return obj as unknown as DecorationOptions;
  });
}

function parseAnnotatorOutput<T>(
  commandResult: string,
  parseItem: (
    obj: Record<string, unknown>,
    line: number,
    content: string,
  ) => T | AnnotatorOutputError | undefined,
): AnnotatorOutputResult<T> {
  const items: T[] = [];
  const errors: AnnotatorOutputError[] = [];

  commandResult.split("\n").forEach((content, index) => {
    if (content.length === 0) {
      return;
    }

    const line = index + 1;
    let obj: unknown;
    try {
      obj = JSON.parse(content);
    } catch (err) {
      errors.push(
        invalidOutput(
          line,
          content,
          `invalid JSON: ${formatUnknownError(err)}`,
        ),
      );
      return;
    }

    if (!isRecord(obj)) {
      errors.push(invalidOutput(line, content, "output must be an object"));
      return;
    }

    const item = parseItem(obj, line, content);
    if (item === undefined) {
      return;
    }

    if (isAnnotatorOutputError(item)) {
      errors.push(item);
      return;
    }

    items.push(item);
  });

  return { items, errors };
}

function isValidRange(value: unknown): value is RangeLike {
  if (!isRecord(value)) {
    return false;
  }

  const { start, end } = value;
  if (!isRecord(start) || !isRecord(end)) {
    return false;
  }

  return (
    isNonNegativeNumber(start.line) &&
    isNonNegativeNumber(start.character) &&
    isNonNegativeNumber(end.line) &&
    isNonNegativeNumber(end.character)
  );
}

function invalidOutput(
  line: number,
  content: string,
  message: string,
): AnnotatorOutputError {
  return { line, content, message };
}

function isAnnotatorOutputError(value: unknown): value is AnnotatorOutputError {
  return (
    isRecord(value) &&
    typeof value.line === "number" &&
    typeof value.content === "string" &&
    typeof value.message === "string"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isIntegerInRange(
  value: unknown,
  minimum: number,
  maximum: number,
): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= minimum &&
    value <= maximum
  );
}

function formatUnknownError(err: unknown): string {
  if (err instanceof Error) {
    return err.message;
  }

  return String(err);
}
