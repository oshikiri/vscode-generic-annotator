import { runDiagnosticsTests } from "./diagnostics.test";

export async function run(): Promise<void> {
  await runDiagnosticsTests();
}
