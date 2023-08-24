import { execPromise } from "./../exec";
import { expect, describe, test } from "@jest/globals";

describe("exec", () => {
  describe("when an echo command is passed", () => {
    test("returns a fulfilled promise", async () => {
      expect(execPromise("echo Hi")).resolves.toEqual("Hi\n");
    });
  });
  describe("when a failing command is passed", () => {
    test("returns rejected promise", async () => {
      return expect(execPromise("test 0 -eq 1")).rejects.toThrow();
    });
  });
  describe("when `node -v` command is passed", () => {
    test("returns a fulfilled promise", async () => {
      return expect(execPromise("node -v")).resolves.toMatch(
        /^v\d+\.\d+\.\d+\n$/,
      );
    });
  });
});
