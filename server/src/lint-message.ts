export interface LintMessage {
  filePath: string;
  startLineNumber: number;
  endLineNumber: number;
  startCharacterposition: number;
  endCharacterposition: number;
  message: string;
  logLevel: string;
  source: string;
}
