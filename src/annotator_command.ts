import { ExecError, execPromise } from "./exec";
import { outputChannel } from "./vscode_helper";

type AnnotatorCommandContext = {
  command: string;
  filePath: string;
  workspacePath: string;
};

export async function runAnnotatorCommand(
  context: AnnotatorCommandContext,
): Promise<string> {
  const startedAt = Date.now();
  outputChannel.appendLine(formatCommandStart(context));

  try {
    const stdout = await execPromise(context.command);
    outputChannel.appendLine(`command finished in ${Date.now() - startedAt}ms`);
    return stdout;
  } catch (err) {
    outputChannel.appendLine(`command failed in ${Date.now() - startedAt}ms`);

    if (err instanceof ExecError) {
      outputChannel.appendLine(formatExecErrorDetails(err));
    }

    throw err;
  }
}

function formatCommandStart(context: AnnotatorCommandContext): string {
  return [
    "running annotator command",
    `command: ${context.command}`,
    `file: ${context.filePath}`,
    `workspaceRoot: ${context.workspacePath}`,
  ].join("\n");
}

function formatExecErrorDetails(err: ExecError): string {
  const details = [
    `message: ${err.message}`,
    `exitCode: ${err.exitCode ?? "none"}`,
    `signal: ${err.signal ?? "none"}`,
  ];

  if (err.stderr) {
    details.push(`stderr: ${truncate(err.stderr)}`);
  }

  if (err.stdout) {
    details.push(`stdout: ${truncate(err.stdout)}`);
  }

  return details.join("\n");
}

function truncate(value: string): string {
  const maxLength = 4000;
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength)}\n... truncated`;
}
