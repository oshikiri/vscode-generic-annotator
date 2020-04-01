import * as vscode from 'vscode';
import * as assert from 'assert';
import { getDocUri, activate } from './helper';

suite('diagnostics tests', () => {
	test('imbalance.ledger', async () => {
		const docUri = getDocUri('imbalance.ledger');
		await activate(docUri);
		await testDiagnostics(docUri, [
			{
				message: 'imbalanced transaction, (total amount) = -1800 JPY',
				range: toRange(0, 0, 0, 80),
				severity: vscode.DiagnosticSeverity.Error,
				source: 'ledgerlint',
			},
			{
				message: 'imbalanced transaction, (total amount) = -18000 JPY',
				range: toRange(4, 0, 4, 80),
				severity: vscode.DiagnosticSeverity.Error,
				source: 'ledgerlint',
			},
		]);
	});

	test('unknown-account.ledger', async () => {
		const docUri = getDocUri('unknown-account.ledger');
		await activate(docUri);

		const config = vscode.workspace.getConfiguration('ledgerlint');
		console.log({config});
		// await config.update('accountsPath', 'testFixture/accounts.txt');

		await testDiagnostics(docUri, [
			{
				message: 'unknown account: Assets:Unknown',
				range: toRange(3, 0, 3, 80),
				severity: vscode.DiagnosticSeverity.Error,
				source: 'ledgerlint',
			},
		]);

		// await config.update('accountsPath', '');
	});
});

function toRange(sLine: number, sChar: number, eLine: number, eChar: number) {
	const start = new vscode.Position(sLine, sChar);
	const end = new vscode.Position(eLine, eChar);
	return new vscode.Range(start, end);
}

async function testDiagnostics(docUri: vscode.Uri, expectedDiagnostics: vscode.Diagnostic[]) {
	const actualDiagnostics = vscode.languages.getDiagnostics(docUri);

	assert.equal(actualDiagnostics.length, expectedDiagnostics.length, `Unexpected number of diagnostics`);

	expectedDiagnostics.forEach((expectedDiagnostic, i) => {
		const actualDiagnostic = actualDiagnostics[i];
		assert.equal(actualDiagnostic.message, expectedDiagnostic.message, 'Message unmatched');
		assert.deepEqual(actualDiagnostic.range, expectedDiagnostic.range, 'Unexpected range');
		assert.equal(actualDiagnostic.severity, expectedDiagnostic.severity, 'Unexpected severity');
	});
}