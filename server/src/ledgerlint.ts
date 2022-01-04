import { execPromise } from "./exec";

export class LintMessage {
  filePath: string;
  lineNumber: number;
  message: string;
  logLevel: string;
  constructor(
    filePath: string,
    lineNumber: number,
    message: string,
    logLevel: string
  ) {
    this.filePath = filePath;
    this.lineNumber = lineNumber;
    this.message = message;
    this.logLevel = logLevel;
  }
}

export async function runLedgerLint(
  absPath: string,
  accountPath: string
): Promise<LintMessage[]> {
  let command = `ledgerlint -j -f $(realpath --relative-to=. ${absPath})`;
  if (accountPath !== "") {
    command += ` -account ${accountPath}`;
  }

  const stdout = await execPromise(command);
  const lintMsgJsons = String(stdout).split("\n");
  const messages: LintMessage[] = [];
  lintMsgJsons.forEach((lingMsgJson) => {
    if (lingMsgJson === "") {
      return;
    }
    const rawError = JSON.parse(lingMsgJson);
    const lintMsg = new LintMessage(
      rawError["file_path"],
      Number(rawError["line_number"]) - 1,
      rawError["error_message"],
      rawError["level"]
    );
    messages.push(lintMsg);
  });

  return messages;
}
