export function createCommand(
  commandTemplate: string,
  docPath: string,
  workspacePath: string,
): string {
  return commandTemplate
    .replace("${path}", docPath)
    .replace("${workspaceRoot}", workspacePath);
}
