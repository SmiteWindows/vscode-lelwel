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

- **13 comprehensive tests** covering extension functionality
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

- 自动格式化（保存时）
- 任务运行（编译、检查、格式化）
- 调试支持
- 测试运行

推荐安装的VS Code扩展：

- Oven.bun-vscode - Bun支持
- DedsecX3000.oxlint - oxlint支持
- DedsecX3000.oxfmt - oxcfmt支持
- ms-vscode.extension-test-runner - 测试运行器
- ms-vscode.vscode-typescript-next - 最新TypeScript支持

## 注意事项

- 确保使用Bun 1.3.9或更高版本
- 使用`bunx`运行命令而不是全局安装的版本
- WASM构建需要Rust工具链和wasm32-wasip1-threads目标
  - `rustup target add wasm32-wasip1-threads`
