export function createCommand(
  commandTemplate: string,
  docPath: string,
  workspacePath: string,
): string {
  return commandTemplate
    .split("${path}")
    .join(shellQuote(docPath))
    .split("${workspaceRoot}")
    .join(shellQuote(workspacePath));
}

/**
 * Quotes a placeholder value for use as a single POSIX shell argument.
 *
 * commandTemplate is executed by a shell, so path-like placeholders must not be
 * interpolated as raw strings.
 */
function shellQuote(value: string): string {
  return `'${value.replace(/'/g, "'\\''")}'`;
}
