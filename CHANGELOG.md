# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Changed
- **BREAKING**: Migrated from `wasm32-wasip1-threads` to `wasm32-wasip2` target
  - WASM file size reduced from 1.58 MB to 192 KB (87% reduction)
  - Improved compatibility with latest WebAssembly standards
  - Better performance and stability with WASIp2
  - Updated build scripts in `package.json` and `scripts/build-stable.mjs`

### Fixed
- Updated `vscode-languageclient` from 9.0.1 to 10.0.0-next.20 to match `@vscode/wasm-wasi-lsp` peer dependencies
- Fixed output channel type to use `LogOutputChannel` for compatibility with vscode-languageclient 10.0.0-next.20

### Updated
- Updated lelwel submodule to latest version (v0.10.2 + 5 commits)
  - Updated dependencies:
    - `logos` now uses forked version from `https://github.com/SmiteWindows/logos`
    - `codespan-reporting` and `codespan-lsp` now use forked version from `https://github.com/SmiteWindows/codespan`
    - Replaced `lsp-types` with `ls-types` from `https://github.com/SmiteWindows/ls-types`
  - Added `rust-version = "1.93"` to Cargo.toml
  - Improved LSP type handling with custom `ls-types` crate
  - Fixed conditional node elision in left recursive rules
  - Simplified JSON example
  - Fixed JSON value conversion example with leading whitespace

### Changed
- Rebuilt WASM module with latest lelwel changes
- Updated package.json build scripts for better production builds

## [0.1.1] - 2024-XX-XX

### Added
- Initial release
- Syntax highlighting for `.llw` files
- Language server integration via `lelwel-ls`
- Diagnostics and structure-aware feedback
- WebAssembly-based language server for zero-dependency deployment
