import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
const expect = chai.expect;

const { execPromise } = require('./../src/exec');

describe('exec', () => {
	context('when an echo command is passed', () => {
		it('returns a fulfilled promise', async ()=>{
			return expect(execPromise('echo Hi')).eventually.equal('Hi\n');
		});
	});
	context('when a failing command is passed', () => {
		it('returns rejected promise', async ()=>{
			return expect(execPromise('test 0 -eq 1')).eventually.rejected;
		});
	});
	context('when ledgerlint -h command is passed', () => {
		it.skip('returns a fulfilled promise', () => {
			return expect(execPromise('ledgerlint -h || test $? -eq 2')).eventually.be.a('string').and.match(/^Usage of ledgerlint/);
		});
	});
});
