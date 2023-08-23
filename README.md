# vscode-generic-annotator

VS Code extension for linters

## Usage examples

### [hledger-check](https://hledger.org/1.28/hledger.html#check)

See scripts/hledger-check.js

.vscode/settings.json

```json
{
  "genericAnnotator.annotatorConfigurations": [
    {
      "commandTemplate": "node ${workspaceRoot}/scripts/hledger-check.js $(realpath --relative-to=. ${path})",
      "pathRegex": "\\.ledger$"
    }
  ]
}
```

### Regex

See scripts/regex.js

.vscode/settings.json

```json
{
  "genericAnnotator.annotatorConfigurations": [
    {
      "commandTemplate": "node /path/to/regex.js ${path} '\\d{4}-\\d{2}-\\d{2}'",
      "pathRegex": "\\.ledger$"
    }
  ]
}
```

![screenshot regex](./doc/example_regex.png)

### Day-of-week hints

See scripts/day-of-week-hints.js

.vscode/settings.json

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

## Requirement

- VS Code

## License

See the LICENSE file.

- This repository is based on
  - [lsp-sample](https://github.com/microsoft/vscode-extension-samples/tree/6f16dafc01a248ac39d450ecf56ae73274757644/lsp-sample)
  - [code-actions-sample](https://github.com/microsoft/vscode-extension-samples/tree/133fa26af64ba8760559c5a06299953673d60763/code-actions-sample)
  - [vscode-js-annotations](https://github.com/lannonbr/vscode-js-annotations)
- <div>Icons made by <a href="https://www.freepik.com" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
