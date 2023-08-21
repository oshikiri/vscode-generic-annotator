import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
const expect = chai.expect;

const { execPromise } = require("./../exec");

describe("exec", () => {
  context("when an echo command is passed", () => {
    it("returns a fulfilled promise", async () => {
      return expect(execPromise("echo Hi")).eventually.equal("Hi\n");
    });
  });
  context("when a failing command is passed", () => {
    it("returns rejected promise", async () => {
      return expect(execPromise("test 0 -eq 1")).eventually.rejected;
    });
  });
  context("when node -v command is passed", () => {
    it("returns a fulfilled promise", () => {
      return expect(execPromise("node -v"))
        .eventually.be.a("string")
        .and.match(/^v\d+\.\d+\.\d+\n$/);
    });
  });
});
