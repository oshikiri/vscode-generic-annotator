import { execPromise } from "./exec";
import { LintMessage } from "./lint-message";

export function convertToLintMsg(obj: any): LintMessage {
  return {
    filePath: obj["file_path"],
    startLineNumber: Number(obj["line_number"]) - 1,
    endLineNumber: Number(obj["line_number"]) - 1,
    startCharacterposition: 0,
    endCharacterposition: 80,
    message: obj["error_message"],
    logLevel: obj["level"],
    source: "ledgerlint", // FIXME
  };
}

export async function getLintMessages(command: string): Promise<LintMessage[]> {
  const stdout = await execPromise(command);
  const lintMsgJsons = String(stdout).split("\n");
  const messages: LintMessage[] = [];
  lintMsgJsons.forEach((lingMsgJson) => {
    if (lingMsgJson === "") {
      return;
    }
    const rawError = JSON.parse(lingMsgJson);
    const lintMsg: LintMessage = convertToLintMsg(rawError);
    messages.push(lintMsg);
  });

  return messages;
}
