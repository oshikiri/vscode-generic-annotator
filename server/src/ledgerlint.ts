import { execPromise } from './exec';

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

export async function runLedgerLint(absPath: string, accountPath: string): Promise<LedgerLintError[]> {
	let command = `ledgerlint -f $(realpath --relative-to=. ${absPath})`;
	if (accountPath !== '') {
		command += ` -account ${accountPath}`;
	}

	const stdout = await execPromise(command);
	const lines = String(stdout).split('\n');
	const errors: LedgerLintError[] = [];
	lines.forEach(line => {
		const m = line.match(/^([\w\d\./-]+):(\d+)\s+(.+)$/);
		if (m === null) {
			return;
		}
		const error = new LedgerLintError(absPath, Number(m[2])-1, m[3]);
		errors.push(error);
	});

	return errors;
}
