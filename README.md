# Lelwel for Visual Studio Code

This extension provides [lelwel](https://github.com/0x2a-42/lelwel) language support for VS Code/VSCodium, powered by WebAssembly.

## Features

- Syntax highlighting for `.llw` files
- Language server integration via `lelwel-ls`
- Diagnostics and structure-aware feedback
- Hover information
- Go to definition
- Find references
- Code completion
- Document formatting

## Requirements

- VS Code 1.107.0 or higher
- [WebAssembly Core Extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode.wasm-wasi-core) (automatically installed as dependency)

## Installation

Install from the VS Code Marketplace or build from source:

```sh
git clone https://github.com/0x2a-42/vscode-lelwel.git
cd vscode-lelwel
bun install
bun run build:production
```

## Advanced: Native Language Server

You can install the native `lelwel-ls` via cargo:

```sh
cargo install --features="lsp" lelwel
```

Then enable it in VS Code settings:
```json
{
  "lelwel.nativeLsp": true
}
```

## Configuration

This extension contributes the following settings:

- `lelwel.nativeLsp`: Connect to a 'lelwel-ls' binary instead of using the embedded language server
- `lelwel.format.maxLineWidth`: Maximum line width for formatting (default: 100)
- `lelwel.format.useTabs`: Use tabs for indentation (default: false)
- `lelwel.format.newLine`: Line ending style, 'lf' or 'crlf' (default: 'lf')

## Development

See [CONTRIBUTING.md](CONTRIBUTING.md) for development instructions.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for the list of changes.
