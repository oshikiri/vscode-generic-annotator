import { exec as execCallback } from "child_process";

export type ExecPromiseOptions = {
  timeout?: number;
  maxBuffer?: number;
};

const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_MAX_BUFFER_BYTES = 1024 * 1024;

export class ExecError extends Error {
  readonly command: string;
  readonly stdout: string;
  readonly stderr: string;
  readonly exitCode: number | null;
  readonly signal: NodeJS.Signals | null;

  constructor(params: {
    command: string;
    message: string;
    stdout?: string;
    stderr?: string;
    exitCode?: number | null;
    signal?: NodeJS.Signals | null;
  }) {
    super(params.message);
    this.name = "ExecError";
    this.command = params.command;
    this.stdout = params.stdout ?? "";
    this.stderr = params.stderr ?? "";
    this.exitCode = params.exitCode ?? null;
    this.signal = params.signal ?? null;
  }
}

type ExecFailure = Error & {
  stdout?: string;
  stderr?: string;
  code?: number;
  signal?: NodeJS.Signals;
  killed?: boolean;
};

/**
 * Executes a commandTemplate string through the user's shell.
 *
 * commandTemplate intentionally supports shell syntax, so this uses
 * child_process.exec instead of execFile.
 */
export async function execPromise(
  command: string,
  options: ExecPromiseOptions = {},
): Promise<string> {
  return new Promise((resolve, reject) => {
    execCallback(
      command,
      {
        timeout: options.timeout ?? DEFAULT_TIMEOUT_MS,
        maxBuffer: options.maxBuffer ?? DEFAULT_MAX_BUFFER_BYTES,
      },
      (err, stdout, stderr) => {
        if (!err) {
          resolve(stdout);
          return;
        }

        const failure = err as ExecFailure;
        reject(
          new ExecError({
            command,
            message: failure.message,
            stdout,
            stderr,
            exitCode: failure.code ?? null,
            signal: failure.signal ?? null,
          }),
        );
      },
    );
  });
}
