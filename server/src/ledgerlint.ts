import * as util from 'util';

export class LedgerLintError {
	filePath: string;
	lineNumber: number;
	message: string;
	constructor(
		filePath: string,
		lineNumber: number,
		message: string
	) {
		this.filePath = filePath;
		this.lineNumber = lineNumber;
		this.message = message;
	}
}

const exec = util.promisify(require('child_process').exec);

export async function runLedgerLint(absPath: string): Promise<LedgerLintError[]> {
	// throw Error(absPath); // なぜかここまで来てない
	console.log({absPath});
	// const { stdout } = await exec(`ledgerlint -f $(realpath --relative-to=. ${absPath})`);
	const stdout = 'client/testFixture/imbalance.ledger:1 imbalanced transaction, (total amount) = -1800 JPY\nclient/testFixture/imbalance.ledger:5 imbalanced transaction, (total amount) = -18000 JPY\n';
	console.log({stdout});
	const lines = String(stdout).split('\n');
	const errors: LedgerLintError[] = [];
	lines.forEach(line => {
		const m = line.match(/^([\w\d\./]+):(\d+)\s+(.+)$/);
		if (m === null) {
			return;
		}
		const error = new LedgerLintError(absPath, Number(m[2])-1, m[3]);
		errors.push(error);
	});

	return errors;
}
