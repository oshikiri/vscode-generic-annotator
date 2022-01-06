vscode-ledgerlint
=====

VS Code extension for [ledgerlint](https://github.com/oshikiri/ledgerlint).

![screenshot](./doc/screenshot.png)

## Requirement

- VS Code (>= 1.43)
- ledgerlint


## Development

```sh
# Build package
npm i -g vsce
vsce package
```


## .vscode/settings.json
```json
{
	"ledgerlint.linterConfigurations": [
        {
            "commandTemplate": "ledgerlint -j -f $(realpath --relative-to=. ${path})",
            "pathRegex": ".ledger$"
        }
    ]
}
```

## License

MIT

This repository is based on [lsp-sample](https://github.com/microsoft/vscode-extension-samples/tree/6f16dafc01a248ac39d450ecf56ae73274757644/lsp-sample).
