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


const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function runLedgerLint(absPath: string): Promise<LedgerLintError[]> {
	const { stdout } = await exec(`ledgerlint -f $(realpath --relative-to=. ${absPath})`);
	const lines = String(stdout).split('\n');
	const errors: LedgerLintError[] =[];
	lines.forEach(line => {
		const m = line.match(/^([\w\d\.]+):(\d+)\s+(.+)$/);
		if (m === null) {
			return;
		}
		const error = new LedgerLintError(m[1], Number(m[2])-1, m[3]);
		errors.push(error);
	});

	return errors;
}
