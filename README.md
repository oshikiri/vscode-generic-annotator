vscode-generic-annotator
=====

VS Code extension for linters


## Usage examples
### [ledgerlint](https://github.com/oshikiri/ledgerlint)
```json
// .vscode/settings.json
{
  "genericAnnotator.annotatorConfigurations": [
    {
      "commandTemplate": "ledgerlint -j -f $(realpath --relative-to=. ${path})",
      "pathRegex": "\\.ledger$"
    }
  ]
}
```

![screenshot ledgerlint](./doc/example_ledgerlint.png)


### Regex
```json
// .vscode/settings.json
{
  "genericAnnotator.annotatorConfigurations": [
    {
      "commandTemplate": "node scripts/regex.js $(realpath --relative-to=. ${path}) '\\d{4}-\\d{2}-\\d{2}'",
      "pathRegex": "\\.ledger$"
    }
  ]
}
```

![screenshot regex](./doc/example_regex.png)



## Requirement

- VS Code (>= 1.43)


## Development

```sh
# Build package
npm i -g vsce
vsce package
```


## License

MIT

- This repository is based on [lsp-sample](https://github.com/microsoft/vscode-extension-samples/tree/6f16dafc01a248ac39d450ecf56ae73274757644/lsp-sample).
- <div>Icons made by <a href="https://www.freepik.com" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
