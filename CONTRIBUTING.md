# Contributing to Lelwel for Visual Studio Code

Thank you for your interest in contributing to the Lelwel VS Code extension! This document provides information on how to set up the development environment and contribute to the project.

## Development Setup

### Prerequisites

- [Bun](https://bun.sh/) (v1.3.9 or later)
- [Rust](https://rustup.rs/) with WASI threads support:
  ```sh
  rustup target add wasm32-wasip1-threads
  ```
- [VS Code](https://code.visualstudio.com/) with the recommended extensions from `.vscode/extensions.json`

### Getting Started

1. Clone the repository:

   ```sh
   git clone https://github.com/0x2a-42/vscode-lelwel.git
   cd vscode-lelwel
   ```

2. Install dependencies:

   ```sh
   bun install
   ```

3. Build the WebAssembly language server:

   ```sh
   bun run build-wasm
   ```

4. Run the extension in development mode:
   ```sh
   bun run dev
   ```

### Development Workflow

#### Running the Extension

- Press `F5` to open a new VS Code window with the extension loaded.
- Open a `.llw` file in that window to test the extension.
- Set breakpoints in `src/extension.ts` to debug the extension.
- Find output from the extension in the debug console.

#### Making Changes

- You can relaunch the extension from the debug toolbar after changing code in `src/extension.ts`.
- You can also reload (`Ctrl+R` or `Cmd+R` on Mac) the VS Code window with the extension to load your changes.
- For faster development, use `bun run dev:fast` which skips clearing the terminal.
- For hot reloading, use `bun run dev:hot` which watches for changes in both TypeScript and Rust files.

#### Updating the Language Server

The lelwel binary is automatically built when you run `bun run build-wasm`.

To update it:

1. Update the git submodule:
   ```sh
   git submodule update --remote lelwel
   ```
2. Rebuild the WebAssembly binary:
   ```sh
   bun run build-wasm
   ```

## Testing

### Running Tests

- Install the [Extension Test Runner](https://marketplace.visualstudio.com/items?itemName=ms-vscode.extension-test-runner).
- Run the "watch" task via the **Tasks: Run Task** command. Make sure this is running, or tests might not be discovered.
- Open the Testing view from the activity bar and click the Run Test button, or use the hotkey `Ctrl/Cmd + ; A`.
- See the output of the test result in the Test Results view.

### Test Structure

- Make changes to `src/test/extension.test.ts` or create new test files inside the `test` folder.
- The test runner only considers files matching the name pattern `**.test.ts`.
- You can create folders inside the `test` folder to structure tests any way you want.

### Test Commands

```bash
# Run all tests
bun run test

# Run unit tests only
bun run test:unit

# Run integration tests only
bun run test:integration

# Run tests in watch mode
bun run test:watch

# Run tests with coverage
bun run test:coverage
```

## Code Quality

### Linting and Formatting

```bash
# Run linter
bun run lint

# Run linter and fix issues
bun run lint:fix

# Format code
bun run format

# Check code formatting
bun run format:check
```

### Type Checking

```bash
# Run TypeScript type checking
bun run type-check
```

## Building and Packaging

### Building the Extension

```bash
# Build for development
bun run build:dev

# Build for production
bun run build:production

# Build in parallel
bun run build:parallel
```

### Packaging the Extension

To build a `.vsix` package from the extension:

```bash
bun run package
```

## Submitting Changes

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/amazing-feature`.
3. Make your changes.
4. Run tests and ensure code quality:
   ```bash
   bun run lint
   bun run type-check
   bun run test
   ```
5. Commit your changes: `git commit -m 'Add amazing feature'`.
6. Push to the branch: `git push origin feature/amazing-feature`.
7. Open a pull request.

## Project Structure

```
.
├── .vscode/           # VS Code configuration
│   ├── extensions.json # Recommended extensions
│   ├── launch.json     # Debug configuration
│   ├── settings.json   # Workspace settings
│   └── tasks.json     # Build tasks
├── src/              # Extension source code
│   ├── test/          # Test files
│   └── extension.ts   # Main extension file
├── testFixture/      # Test files for lelwel grammar
├── lelwel/           # Rust language server source (git submodule)
├── syntaxes/         # TextMate grammar files
├── server/           # Compiled WebAssembly language server
└── dist/             # Compiled extension
```

## Additional Resources

- [VS Code Extension API](https://code.visualstudio.com/api)
- [Bun Documentation](https://bun.sh/docs)
- [Lelwel Documentation](https://github.com/SmiteWindows/lelwel)
- [WebAssembly](https://webassembly.org/)

## Getting Help

If you have questions or need help:

- Create an issue in the [GitHub repository](https://github.com/0x2a-42/vscode-lelwel/issues).
- Join our [Discord server](https://discord.gg/your-invite) (if available).
- Check the [documentation](https://github.com/0x2a-42/vscode-lelwel/wiki).
