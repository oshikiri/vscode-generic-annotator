import { execPromise } from '../src/exec';

describe('exec', () => {
	test('Run echo command', async ()=>{
		return expect(execPromise('echo Hi')).resolves.toEqual('Hi\n');
	});
	test('Run failing command', async ()=>{
		return expect(execPromise('test 0 -eq 1')).rejects;
	});
});
