import { execPromise } from "./exec";
import { Diagnostic, Range, DiagnosticSeverity } from "vscode-languageserver";

function getSeverity(logLevel: string): DiagnosticSeverity {
  if (logLevel === "WARN") {
    return DiagnosticSeverity.Warning;
  } else if (logLevel === "ERROR") {
    return DiagnosticSeverity.Error;
  } else {
    return DiagnosticSeverity.Information;
  }
}

function convertToDiagnostic(obj: any): Diagnostic {
  const lineNumber = Number(obj["line_number"]) - 1;
  return {
    range: Range.create(lineNumber, 0, lineNumber, 80),
    message: obj["error_message"],
    source: "ledgerlint", // FIXME
    severity: getSeverity(obj["level"]),
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
