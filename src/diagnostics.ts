import { execPromise } from "./exec";
import { Diagnostic } from "vscode";

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
      const diagnostic = lintMsg as Diagnostic;
      if (isValidDiagnostic(diagnostic)) {
        diagnostics.push(diagnostic);
      } else {
        console.log(`range error: ${JSON.stringify(diagnostic)}`);
      }
    });
  } catch (err: any) {
    console.log(err);
    const diagnostic = getErrorDiagnostic(err.msg, command);
    diagnostics.push(diagnostic);
  }
  return diagnostics;
}

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
    severity: 1,
  } as Diagnostic;
  return diagnostic;
}
