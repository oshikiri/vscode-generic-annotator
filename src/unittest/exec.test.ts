import { ExecError, execPromise } from "./../exec";
import { expect, describe, test } from "@jest/globals";

describe("exec", () => {
  describe("when an echo command is passed", () => {
    test("returns a fulfilled promise", async () => {
      expect(execPromise("echo Hi")).resolves.toEqual("Hi\n");
    });
  });
  describe("when a failing command is passed", () => {
    test("rejects with ExecError", async () => {
      await expect(execPromise("test 0 -eq 1")).rejects.toBeInstanceOf(
        ExecError,
      );
    });

    test("captures stderr and exit code", async () => {
      await expect(
        execPromise("printf 'failure\\n' >&2; exit 7"),
      ).rejects.toMatchObject({
        stderr: "failure\n",
        exitCode: 7,
      });
    });

    test("captures stdout emitted before failure", async () => {
      await expect(
        execPromise("printf 'partial\\n'; exit 2"),
      ).rejects.toMatchObject({
        stdout: "partial\n",
        exitCode: 2,
      });
    });

    test("rejects when the command times out", async () => {
      await expect(
        execPromise('node -e "setTimeout(() => {}, 1000)"', {
          timeout: 10,
        }),
      ).rejects.toBeInstanceOf(ExecError);
    });

    test("rejects when output exceeds maxBuffer", async () => {
      await expect(
        execPromise("yes x | head -c 1024", {
          maxBuffer: 10,
        }),
      ).rejects.toBeInstanceOf(ExecError);
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
