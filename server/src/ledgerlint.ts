import { execPromise } from "./exec";
import { LintMessage } from "./lint-message";

export async function runLedgerLint(absPath: string): Promise<LintMessage[]> {
  const command = `ledgerlint -j -f $(realpath --relative-to=. ${absPath})`;

  const stdout = await execPromise(command);
  const lintMsgJsons = String(stdout).split("\n");
  const messages: LintMessage[] = [];
  lintMsgJsons.forEach((lingMsgJson) => {
    if (lingMsgJson === "") {
      return;
    }
    const rawError = JSON.parse(lingMsgJson);
    const lintMsg: LintMessage = {
      filePath: rawError["file_path"],
      startLineNumber: Number(rawError["line_number"]) - 1,
      endLineNumber: Number(rawError["line_number"]) - 1,
      startCharacterposition: 0,
      endCharacterposition: 80,
      message: rawError["error_message"],
      logLevel: rawError["level"],
    };

    messages.push(lintMsg);
  });

  return messages;
}
