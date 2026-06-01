import { ExecError } from "./exec";
import { Diagnostic } from "vscode";
import { outputChannel } from "./vscode_helper";
import { parseDiagnosticOutput } from "./annotator_output";
import { runAnnotatorCommand } from "./annotator_command";

export async function getDiagnostics(
  command: string,
  filePath: string,
  workspacePath: string,
): Promise<Diagnostic[]> {
  const diagnostics: Diagnostic[] = [];
  try {
    const stdout = await runAnnotatorCommand({
      command,
      filePath,
      workspacePath,
    });
    const result = parseDiagnosticOutput(stdout);
    diagnostics.push(...result.items);
    if (result.errors.length > 0) {
      const message = formatOutputErrors(result.errors);
      outputChannel.appendLine(message);
      diagnostics.push(getErrorDiagnostic(message, command));
    }
  } catch (err: unknown) {
    const message = formatErrorMessage(err);
    outputChannel.appendLine(message);
    const diagnostic = getErrorDiagnostic(message, command);
    diagnostics.push(diagnostic);
  }
  return diagnostics;
}

function formatOutputErrors(
  errors: ReturnType<typeof parseDiagnosticOutput>["errors"],
): string {
  return errors
    .map((err) => `line ${err.line}: ${err.message}\ncontent: ${err.content}`)
    .join("\n");
}

function formatErrorMessage(err: unknown): string {
  if (err instanceof ExecError) {
    return [
      `command failed: ${err.command}`,
      `message: ${err.message}`,
      `exitCode: ${err.exitCode ?? "none"}`,
      `signal: ${err.signal ?? "none"}`,
      "See the Generic Annotator output channel for stdout and stderr.",
    ].join("\n");
  }

  if (err instanceof Error) {
    return err.message;
  }

  if (hasMessageProperty(err)) {
    return err.msg;
  }

  return String(err);
}

function hasMessageProperty(err: unknown): err is { msg: string } {
  return (
    typeof err === "object" &&
    err !== null &&
    "msg" in err &&
    typeof err.msg === "string"
  );
}

function getErrorDiagnostic(message: string, source: string): Diagnostic {
  const diagnostic = {
    range: {
      start: {
        line: 0,
        character: 0,
      },
      end: {
        line: 0,
        character: 100,
      },
    },
    message: "Runtime error: \n" + message,
    source,
    severity: 0,
  } as Diagnostic;
  return diagnostic;
}
