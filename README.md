# vscode-generic-annotator

![screenshot regex](./doc/example_regex.png)

This VS Code extension allows you to integrate any command-line tool (like linters or custom scripts) into VS Code's diagnostics system. It works by letting you define a "wrapper script" that converts your tool's output into a standardized JSON format, which the extension then displays as annotations in your editor.

**How it works:**

1.  **Choose your tool:** Select any command-line tool you want to integrate.
2.  **Create a wrapper script:** Write a simple script (e.g., in Node.js, Python, or Bash) that runs your tool and converts its output into the JSON format expected by this extension.
3.  **Configure in VS Code:** Add a few lines to your `.vscode/settings.json` to tell the extension how to run your wrapper script and for which file types.

See the `Usage examples` section for detailed setup instructions.

## Motivation

VS Code offers a multiline problem matcher feature:

- [Integrate with External Tools via Tasks > Defining a multiline problem matcher](https://code.visualstudio.com/docs/editor/tasks#_defining-a-multiline-problem-matcher)

While the multiline problem matcher is powerful, `vscode-generic-annotator` provides additional flexibility, particularly for tools with complex output formats, existing JSON outputs, or when advanced parsing logic is required beyond simple regular expressions.

The resolution of [Problem matchers for error messages that span multiple lines · Issue #9635 · microsoft/vscode](https://github.com/microsoft/vscode/issues/9635) might reduce the need for this extension in some scenarios, though it offers some benefits for complex parsing.

## Usage examples

The following configuration examples should be added to your VS Code user or workspace settings (`.vscode/settings.json`).

### hledger-check

This example demonstrates how to use `vscode-generic-annotator` with `hledger check` to display ledger file diagnostics. The `scripts/hledger-check.js` script wraps the `hledger check` command and converts its output into a JSON format that `vscode-generic-annotator` can understand.

See <https://hledger.org/1.30/hledger.html#check>

Here is an example of `hledger check` output:

```
$ hledger check balancednoautoconversion -f ${workspaceRoot}/testFixture/imbalance.ledger
hledger: Error: /path/to/vscode-generic-annotator/testFixture/imbalance.ledger:1-3:
1 | 2020-03-26 * toilet paper
  |     Expences:Household essentials         200 JPY
  |     Assets:Cash                         -2000 JPY

This transaction is unbalanced.
The real postings' sum should be 0 but is: -1800 JPY
Consider adjusting this entry's amounts, or adding missing postings.
```

And its JSON-wrapped output by `scripts/hledger-check.js`:

```
$ node scripts/hledger-check.js testFixture/imbalance.ledger
{"type":"diagnostic","source":"hledger-check","severity":1,"message":"hledger: Error: /path/to/vscode-generic-annotator/testFixture/imbalance.ledger:1-3:\n1 | 2020-03-26 * toilet paper\n  |     Expences:Household essentials         200 JPY\n  |     Assets:Cash                         -2000 JPY\nThis transaction is unbalanced.\nThe real postings' sum should be 0 but is: -1800 JPY\nConsider adjusting this entry's amounts, or adding missing postings.","range":{"start":{"line":0,"character":0},"end":{"line":2,"character":80}}}
```

Then, configure vscode-generic-annotator by adding the following to your `.vscode/settings.json`:

```json
{
  "genericAnnotator.annotatorConfigurations": [
    {
      "commandTemplate": "node ${workspaceRoot}/scripts/hledger-check.js ${path}",
      "pathRegex": "\\.ledger$"
    }
  ]
}
```

Finally you will get the annotations:

![screenshot hledger-check](./doc/example_hledgercheck.png)

### Regex

This example uses `scripts/regex.js` to highlight specific patterns (e.g. `FIXME` or dates) in your files. The script takes a regular expression as an argument and outputs JSON for `vscode-generic-annotator`.

Add the following to your `.vscode/settings.json`:

```json
{
  "genericAnnotator.annotatorConfigurations": [
    {
      "commandTemplate": "node ${workspaceRoot}/scripts/regex.js ${path} '\\d{4}-\\d{2}-\\d{2}'",
      "pathRegex": "\\.ledger$"
    }
  ]
}
```

![screenshot regex](./doc/example_regex.png)

### Day-of-week hints

This example uses `scripts/day-of-week-hints.js` to add day-of-week annotations to your ledger entries. It uses `$(realpath --relative-to=. ${path})` to ensure the script receives a path relative to the workspace root, which is necessary for `hledger` to correctly resolve file paths.

Add the following to your `.vscode/settings.json`:

```json
{
  "genericAnnotator.annotatorConfigurations": [
    {
      "pathRegex": "\\.ledger$",
      "commandTemplate": "node ${workspaceRoot}/scripts/day-of-week-hints.js $(realpath --relative-to=. ${path})"
    }
  ]
}
```

![screenshot day of week hints](./doc/example_dow.png)

## License

See the LICENSE file.

- This repository is based on
  - [lsp-sample](https://github.com/microsoft/vscode-extension-samples/tree/6f16dafc01a248ac39d450ecf56ae73274757644/lsp-sample)
  - [code-actions-sample](https://github.com/microsoft/vscode-extension-samples/tree/133fa26af64ba8760559c5a06299953673d60763/code-actions-sample)
  - [vscode-js-annotations](https://github.com/lannonbr/vscode-js-annotations)
- Icons made by [Freepik](https://www.freepik.com) from [www.flaticon.com](https://www.flaticon.com/)
