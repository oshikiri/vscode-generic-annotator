import * as vscode from 'vscode';
import * as assert from 'assert';
import { getDocUri, activate } from './helper';

suite('Should get diagnostics', () => {
	const docUri = getDocUri('imbalance.ledger');

	test('Diagnoses uppercase texts', async () => {
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
});

function toRange(sLine: number, sChar: number, eLine: number, eChar: number) {
	const start = new vscode.Position(sLine, sChar);
	const end = new vscode.Position(eLine, eChar);
	return new vscode.Range(start, end);
}

async function testDiagnostics(docUri: vscode.Uri, expectedDiagnostics: vscode.Diagnostic[]) {
	await activate(docUri);

	const actualDiagnostics = vscode.languages.getDiagnostics(docUri);

	assert.equal(actualDiagnostics.length, expectedDiagnostics.length, 'Unexpected number of diagnostics');

	expectedDiagnostics.forEach((expectedDiagnostic, i) => {
		const actualDiagnostic = actualDiagnostics[i];
		assert.equal(actualDiagnostic.message, expectedDiagnostic.message, 'Message unmatched');
		assert.deepEqual(actualDiagnostic.range, expectedDiagnostic.range, 'Unexpected range');
		assert.equal(actualDiagnostic.severity, expectedDiagnostic.severity, 'Unexpected severity');
	});
}