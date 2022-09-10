import * as vscode from "vscode";
import * as assert from "assert";
import { getDocUri, activate } from "./helper";

suite("diagnostics tests", () => {
  test("imbalance.ledger", async () => {
    const docUri = getDocUri("imbalance.ledger");
    await activate(docUri);
    await testDiagnostics(docUri, [
      {
        message: "imbalanced transaction, (total amount) = -1800 JPY",
        range: toRange(0, 0, 0, 80),
        severity: 1,
        source: "ledgerlint",
      },
      {
        message: "imbalanced transaction, (total amount) = -18000 JPY",
        range: toRange(4, 0, 4, 80),
        severity: 1,
        source: "ledgerlint",
      },
    ]);
  });
});

function toRange(sLine: number, sChar: number, eLine: number, eChar: number) {
  const start = new vscode.Position(sLine, sChar);
  const end = new vscode.Position(eLine, eChar);
  return new vscode.Range(start, end);
}

async function testDiagnostics(
  docUri: vscode.Uri,
  expectedDiagnostics: vscode.Diagnostic[]
) {
  const actualDiagnostics = vscode.languages.getDiagnostics(docUri);

  assert.strictEqual(
    actualDiagnostics.length,
    expectedDiagnostics.length,
    `Unexpected number of diagnostics`
  );

  expectedDiagnostics.forEach((expectedDiagnostic, i) => {
    const actualDiagnostic = actualDiagnostics[i];
    console.log(JSON.stringify(actualDiagnostic));
    assert.strictEqual(
      actualDiagnostic.message,
      expectedDiagnostic.message,
      "Message unmatched"
    );
    assert.strictEqual(
      actualDiagnostic.range.start.line,
      expectedDiagnostic.range.start.line
    );
    assert.strictEqual(
      actualDiagnostic.range.start.character,
      expectedDiagnostic.range.start.character
    );
    assert.strictEqual(
      actualDiagnostic.range.start,
      expectedDiagnostic.range.start
    );
    assert.strictEqual(
      actualDiagnostic.severity,
      expectedDiagnostic.severity,
      "Unexpected severity"
    );
  });
}
