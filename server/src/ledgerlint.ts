import { execPromise } from "./exec";

export class LedgerLintError {
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
): Promise<LedgerLintError[]> {
  let command = `ledgerlint -j -f $(realpath --relative-to=. ${absPath})`;
  if (accountPath !== "") {
    command += ` -account ${accountPath}`;
  }

  const stdout = await execPromise(command);
  const errorJsons = String(stdout).split("\n");
  const errors: LedgerLintError[] = [];
  errorJsons.forEach((errorJson) => {
    if (errorJson === "") {
      return;
    }
    const rawError = JSON.parse(errorJson);
    const error = new LedgerLintError(
      rawError["file_path"],
      Number(rawError["line_number"]) - 1,
      rawError["error_message"],
      rawError["level"]
    );
    errors.push(error);
  });

  return errors;
}
