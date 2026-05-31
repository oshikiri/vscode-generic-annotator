#!/usr/bin/env bash

export CODE_TESTS_PATH="$(pwd)/out/test"
export CODE_TESTS_WORKSPACE="$(pwd)/testFixture"
TEST_WORKSPACE_SETTINGS="$CODE_TESTS_WORKSPACE/.vscode/settings.json"

cleanup() {
  rm -f "$TEST_WORKSPACE_SETTINGS"
}

trap cleanup EXIT

unset ELECTRON_RUN_AS_NODE
unset VSCODE_CLI
unset VSCODE_IPC_HOOK
unset VSCODE_IPC_HOOK_CLI
unset VSCODE_ESM_ENTRYPOINT
unset VSCODE_CRASH_REPORTER_PROCESS_TYPE

node "$(pwd)/out/test/runTest"
