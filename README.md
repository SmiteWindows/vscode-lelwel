# Lelwel for Visual Studio Code

This extension provides [lelwel](https://github.com/SmiteWindows/lelwel) language support for VS Code/VSCodium, powered by WebAssembly.

## Features

- Syntax highlighting for `.llw` files
- Language server integration via `lelwel-ls`
- Diagnostics and structure-aware feedback
- Code completion for lelwel grammar constructs
- Go to definition for grammar rules
- Error highlighting and navigation

## Installation

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "lelwel"
4. Click Install

## Development

This extension is built with Bun and uses WebAssembly for the language server. See [README-BUN-SHELL.md](./README-BUN-SHELL.md) for details on the build system.

### Prerequisites

- [Bun](https://bun.sh/) (v1.3.9 or later)
- [Rust](https://rustup.rs/) (for building the WebAssembly language server)

### Building

```bash
# Clone the repository
git clone https://github.com/0x2a-42/vscode-lelwel.git
cd vscode-lelwel

# Install dependencies
bun install

# Build the extension
bun run build

# Run in development mode
bun run dev
```

### Testing

```bash
# Run all tests
bun run test

# Run unit tests only
bun run test:unit

# Run integration tests only
bun run test:integration

# Run tests with coverage
bun run test:coverage
```

### Packaging

```bash
# Package the extension into a VSIX file
bun run package
```

## Configuration

The extension contributes the following settings:

- `lelwel.nativeLsp`: Connect to a native `lelwel-ls` binary instead of using the embedded WebAssembly version

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

## File Structure

```
.
├── .vscode/           # VS Code configuration
├── src/              # Extension source code
├── testFixture/      # Test files for lelwel grammar
├── lelwel/           # Rust language server source
├── syntaxes/         # TextMate grammar files
├── server/           # Compiled WebAssembly language server
└── dist/             # Compiled extension
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see [LICENSE](./LICENSE) file for details.

## Credits

- [lelwel](https://github.com/SmiteWindows/lelwel) - The lelwel parser generator
- [Bun](https://bun.sh/) - JavaScript runtime and build tool
- [VS Code API](https://code.visualstudio.com/api) - Extension API
