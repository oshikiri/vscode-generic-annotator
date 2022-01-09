vscode-generic-annotator
=====

VS Code extension for linters

ex. [ledgerlint](https://github.com/oshikiri/ledgerlint).

![screenshot](./doc/screenshot.png)

## Requirement

- VS Code (>= 1.43)


## Development

```sh
# Build package
npm i -g vsce
vsce package
```


## .vscode/settings.json
```json
{
  "genericAnnotator.linterConfigurations": [
    {
      "commandTemplate": "ledgerlint -j -f $(realpath --relative-to=. ${path})",
      "pathRegex": ".ledger$"
    }
  ]
}

```
```json
{
  "genericAnnotator.linterConfigurations": [
    {
      "commandTemplate": "node scripts/example_linter.js $(realpath --relative-to=. ${path})",
      "pathRegex": ".ledger$"
    }
  ]
}
```

## License

MIT

This repository is based on [lsp-sample](https://github.com/microsoft/vscode-extension-samples/tree/6f16dafc01a248ac39d450ecf56ae73274757644/lsp-sample).

<div>Icons made by <a href="https://www.freepik.com" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
