# Bun Development Guide

This project uses Bun as the package manager and build tool, with comprehensive testing and development workflows.

## Quick Start

```bash
# Install dependencies
bun install

# Build and run in development mode
bun run build:dev
bun run dev:hot
```

## Development Workflow

### Core Commands

```bash
# Development (recommended)
bun run dev:hot          # Hot reload with TypeScript and Rust monitoring
bun run dev              # Simple development mode
bun run dev:fast         # Fast development (no clear)

# Building
bun run build:dev        # Development build with sourcemaps
bun run build:production # Production build with minification
bun run build            # Standard build

# Testing (13 tests total)
bun run test             # Run all tests
bun run test:unit        # Unit tests only
bun run test:integration # Integration tests only
bun run test:watch       # Watch mode
bun run test:coverage    # With coverage report

# Quality Assurance
bun run lint             # Code linting
bun run lint:fix         # Auto-fix linting issues
bun run format           # Code formatting
bun run type-check       # TypeScript type checking

# Packaging
bun run package          # Create VSIX package
bun run clean            # Clean build artifacts
```

### WASM Development

```bash
# Build WASM language server
bun run build-wasm

# Monitor Rust files (optional)
bun run watch:wasm
```

## Project Structure

```
.
├── src/                 # TypeScript extension source
├── lelwel/             # Rust language server source
├── server/             # Compiled WASM files
├── dist/               # Compiled extension
├── testFixture/        # Test files
└── syntaxes/          # TextMate grammar
```

## Testing Infrastructure

- **Comprehensive tests** covering extension functionality
- **Unit tests**: Core extension functions
- **Integration tests**: LSP server integration and error handling
- **Mock system**: Test-specific extension mocking to avoid vscode module issues

## Build System Features

### Multi-stage Build Process

1. **WASM Preparation**: Prepare Rust build environment
2. **WASM Compilation**: Compile Rust to WebAssembly
3. **File Copying**: Copy WASM files to server directory
4. **TypeScript Build**: Compile extension with proper configuration

### Development Modes

- **Hot Reload**: Automatic rebuilding on file changes
- **Fast Development**: Optimized for quick iteration
- **Production Build**: Optimized for distribution

## Configuration Files

- `package.json` - Build scripts and dependencies
- `tsconfig.json` - TypeScript configuration
- `.vscode/` - VS Code debugging and task configurations
- `bunfig.toml` - Bun runtime configuration

## VS Code Integration

Project includes comprehensive VS Code configuration:

- **Debug configurations** for extension development
- **Task definitions** for build automation
- **Launch profiles** for different development scenarios
- **Auto-formatting** on save
- **Task execution** for compilation, linting, and formatting
- **Debugging support** with breakpoints and step-through
- **Test execution** with integrated test runner

### Recommended VS Code Extensions

- **oven.bun-vscode** - Bun runtime and tooling support
- **oxc.oxc-vscode** - oxlint oxfmt integration for code quality
- **ms-vscode.extension-test-runner** - Extension testing framework
- **ms-vscode.vscode-typescript-next** - Latest TypeScript features

## Important Notes

- Ensure Bun 1.3.9 or later is installed
- Use `bunx` to run commands instead of globally installed versions
- WASM build requires Rust toolchain and wasm32-wasip1-threads target
  - Install with: `rustup target add wasm32-wasip1-threads`
- All tests should pass before committing changes
- Use `bun run build:dev` for development builds with sourcemaps
- Use `bun run build:production` for optimized production builds
