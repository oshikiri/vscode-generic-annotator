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
  const diagnostics: Diagnostic[] = [];
  try {
    const stdout = await execPromise(command);
    const lintMsgJsons = String(stdout).split("\n");
    lintMsgJsons.forEach((lintMsgJson) => {
      if (lintMsgJson === "") {
        return;
      }
      const lintMsg = JSON.parse(lintMsgJson);
      const diagnostic = convertToDiagnostic(lintMsg);
      if (isValidDiagnostic(diagnostic)) {
        diagnostics.push(diagnostic);
      } else {
        console.log(`range error: ${JSON.stringify(diagnostic)}`);
      }
    });
  } catch (err) {
    console.log(err);
  }
  return diagnostics;
}

function isValidDiagnostic(diagnostic: Diagnostic): boolean {
  return diagnostic?.range?.start?.line >= 0;
}
