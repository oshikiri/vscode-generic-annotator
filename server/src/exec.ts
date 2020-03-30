import * as util from 'util';

const exec = util.promisify(require('child_process').exec);

class ExecError extends Error {}

export async function execPromise(command: string): Promise<string> {
	let stdout: string;
	let stderr: string = '';
	try {
		const r = await exec(command);
		stdout = r.stdout;
		stderr = r.stderr;

		// const stdout = 'client/testFixture/imbalance.ledger:1 imbalanced transaction, (total amount) = -1800 JPY\nclient/testFixture/imbalance.ledger:5 imbalanced transaction, (total amount) = -18000 JPY\n';
		// console.log({stdout});
		return stdout;
	} catch (err) {
		throw new ExecError(`command = ${command}\nerr = ${err}\nstderr = ${stderr}`);
	}
}
