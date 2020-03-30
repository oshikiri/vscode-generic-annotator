import * as util from 'util';

const exec = util.promisify(require('child_process').exec);

export async function execPromise(command: string): Promise<string> {
	try {
		const { stdout } = await exec(command);
		// const stdout = 'client/testFixture/imbalance.ledger:1 imbalanced transaction, (total amount) = -1800 JPY\nclient/testFixture/imbalance.ledger:5 imbalanced transaction, (total amount) = -18000 JPY\n';
		// console.log({stdout});
		return stdout;
	} catch {
		throw Error(`failed: ${command}`);
	}
}
