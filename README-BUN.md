# 使用 Bun 工具链开发

本项目已配置为使用 Bun 作为包管理器和构建工具，并使用oxlint进行代码检查，oxcfmt 进行代码格式化。

## 安装依赖

```bash
bun install
```

## 开发命令

- `bun run compile` - 编译TypeScript代码（带压缩）
- `bun run watch` - 监听TypeScript文件变化并自动编译
- `bun run dev` - 构建WASM并监听文件变化（推荐用于开发）
- `bun run dev:fast` - 快速开发模式（不清控制台）
- `bun run build-wasm` - 构建WASM二进制文件
- `bun run build` - 构建项目（编译+构建WASM）
- `bun run build:parallel` - 并行构建（WASM和编译同时进行）
- `bun run lint` - 使用oxlint检查代码
- `bun run lint:fix` - 使用oxlint检查并修复代码问题
- `bun run format` - 使用oxcfmt格式化代码
- `bun run format:check` - 检查代码格式是否符合规范
- `bun run type-check` - 类型检查
- `bun run test` - 运行测试
- `bun run test:watch` - 监视模式运行测试
- `bun run test:coverage` - 运行测试并生成覆盖率报告
- `bun run package` - 打包扩展
- `bun run clean` - 清理所有构建产物和缓存
- `bun run clean:artifacts` - 只清理构建产物（dist、server、coverage）
- `bun run clean:cache` - 只清理缓存文件（.tsbuildinfo、.eslintcache、node_modules/.cache）

## 工具链说明

- **Bun**: 替代npm作为包管理器，提供更快的安装速度和内置的构建工具
- **oxlint**: 替代eslint，提供更快的代码检查速度
- **oxfmt**: 替代prettier，提供更快的代码格式化速度
- **TypeScript**: 继续使用TypeScript进行类型检查

## 配置文件

- `bunfig.toml` - Bun配置文件
- `oxlint.json` - oxlint配置文件
- `.oxcfmt.json` - oxfmt配置文件
- `tsconfig.json` - TypeScript配置文件（已更新以适配Bun）

## VS Code集成

项目已配置VS Code集成，支持：

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
