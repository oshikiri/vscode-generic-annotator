import { execPromise } from "./exec";
import { Diagnostic, Range } from "vscode-languageserver";

function convertToDiagnostic(obj: any): Diagnostic {
  const lineNumber = Number(obj["line_number"]) - 1;
  return {
    range: Range.create(lineNumber, 0, lineNumber, 80),
    message: obj["error_message"],
    source: obj["source"],
    severity: obj["severity"],
  };
}

export async function getDiagnostics(command: string): Promise<Diagnostic[]> {
  const stdout = await execPromise(command);
  const lintMsgJsons = String(stdout).split("\n");
  const diagnostics: Diagnostic[] = [];
  lintMsgJsons.forEach((lingMsgJson) => {
    if (lingMsgJson === "") {
      return;
    }
    const rawError = JSON.parse(lingMsgJson);
    const diagnostic = convertToDiagnostic(rawError);
    diagnostics.push(diagnostic);
  });

  return diagnostics;
}
