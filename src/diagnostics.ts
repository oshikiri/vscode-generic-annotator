import { ExecError, execPromise } from "./exec";
import { Diagnostic } from "vscode";
import { outputChannel } from "./vscode_helper";

export async function getDiagnostics(command: string): Promise<Diagnostic[]> {
  const diagnostics: Diagnostic[] = [];
  try {
    const stdout = await execPromise(command);
    const lintMsgJsons = String(stdout).split("\n");
    lintMsgJsons.forEach((lintMsgJson) => {
      if (lintMsgJson === "") {
        return;
      }

      const lintMsg = JSON.parse(lintMsgJson);
      if (lintMsg["type"] !== "diagnostic") {
        return;
      }

      const diagnostic = lintMsg as Diagnostic;
      if (isValidDiagnostic(diagnostic)) {
        diagnostics.push(diagnostic);
      } else {
        throw { msg: `invalid diagnostic: ${JSON.stringify(diagnostic)}` };
      }
    });
  } catch (err: unknown) {
    const message = formatErrorMessage(err);
    outputChannel.appendLine(message);
    const diagnostic = getErrorDiagnostic(message, command);
    diagnostics.push(diagnostic);
  }
  return diagnostics;
}

function formatErrorMessage(err: unknown): string {
  if (err instanceof ExecError) {
    const details = [
      `command: ${err.command}`,
      `message: ${err.message}`,
      `exitCode: ${err.exitCode ?? "none"}`,
      `signal: ${err.signal ?? "none"}`,
    ];

    if (err.stderr) {
      details.push(`stderr: ${err.stderr}`);
    }

    if (err.stdout) {
      details.push(`stdout: ${err.stdout}`);
    }

    return details.join("\n");
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

// FIXME
function isValidDiagnostic(diagnostic: Diagnostic): boolean {
  return diagnostic?.range?.start?.line >= 0;
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
