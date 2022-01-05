import { execPromise } from "./exec";
import { Diagnostic, Range } from "vscode-languageserver";

function convertToRange(obj: any): Range {
  return Range.create(
    obj["startLine"],
    obj["startCharacter"],
    obj["endLine"],
    obj["endCharacter"]
  );
}

function convertToDiagnostic(obj: any): Diagnostic {
  return {
    range: convertToRange(obj["range"]),
    message: obj["message"],
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
