import { outputChannel } from "./vscode_helper";

export type AnnotatorConfiguration = {
  pathRegex: string;
  commandTemplate: string;
};

export function getMatchingAnnotatorConfigurations(
  configs: unknown,
  filePath: string,
): AnnotatorConfiguration[] {
  if (!Array.isArray(configs)) {
    return [];
  }

  return configs.filter((config): config is AnnotatorConfiguration => {
    if (!isAnnotatorConfiguration(config)) {
      return false;
    }

    const pathRegex = createPathRegex(config.pathRegex);
    return pathRegex !== undefined && pathRegex.test(filePath);
  });
}

function isAnnotatorConfiguration(
  value: unknown,
): value is AnnotatorConfiguration {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as AnnotatorConfiguration).pathRegex === "string" &&
    typeof (value as AnnotatorConfiguration).commandTemplate === "string"
  );
}

function createPathRegex(pattern: string): RegExp | undefined {
  try {
    return new RegExp(pattern);
  } catch (err) {
    outputChannel.appendLine(
      `Invalid genericAnnotator.annotatorConfigurations pathRegex: ${pattern}`,
    );
    outputChannel.appendLine(formatUnknownError(err));
    return undefined;
  }
}

function formatUnknownError(err: unknown): string {
  if (err instanceof Error) {
    return err.message;
  }

  return String(err);
}
