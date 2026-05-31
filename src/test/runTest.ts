import * as path from "path";

import { runTests } from "@vscode/test-electron";

async function main() {
  try {
    const extensionDevelopmentPath = path.resolve(__dirname, "../../"); // __dirname is out/test, so ../../ points to out
    const extensionTestsPath = path.resolve(__dirname, "./index");
    const testWorkspace = process.env.CODE_TESTS_WORKSPACE;

    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
      launchArgs: testWorkspace ? [testWorkspace] : [],
    });
  } catch (err) {
    console.error("Failed to run tests");
    process.exit(1);
  }
}

main();
