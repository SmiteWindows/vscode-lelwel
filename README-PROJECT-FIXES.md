# 项目修复说明（第二版）

本文档说明了对 VS Code Lelwel 扩展项目进行的第二轮修复和改进，以及如何使用这些修复。

## 新修复的问题

### 1. 配置文件冲突问题

- **问题**：`.vscode/launch.json` 和 `.vscode/tasks.json` 文件包含重复的配置块，导致 JSON 格式错误
- **修复**：删除重复的配置块，使用一致的格式
- **影响**：VS Code 调试和任务功能可以正常工作

### 2. 测试文件结构问题

- **问题**：存在旧的 `src/test/extension.test.ts` 文件，与新的测试结构冲突
- **修复**：将旧测试文件替换为弃用说明，避免测试冲突
- **影响**：测试覆盖率计算更准确，测试运行更稳定

### 3. 依赖问题

- **问题**：缺少 `concurrently` 依赖，但 `build:parallel` 脚本使用了它；仍包含不需要的 `@types/mocha`
- **修复**：添加 `concurrently` 依赖，移除 `@types/mocha`
- **影响**：构建脚本可以正常工作，减少依赖冗余

### 4. WASM 构建脚本问题

- **问题**：`build-wasm` 脚本使用 `mkdir -p` 命令，在 Windows 上可能不兼容
- **修复**：将构建脚本分解为跨平台的子任务，使用 Bun shell API 创建目录和复制文件
- **影响**：Windows 上构建可以正常工作，利用 Bun 的跨平台特性和高性能

### 5. 热重载配置不完整

- **问题**：`dev:hot` 脚本不会监听 WASM 文件变更
- **修复**：添加 WASM 源码监听，使用 `concurrently` 并行运行多个监听任务，采用 Bun shell API
- **影响**：开发体验更完整，WASM 变更自动重新构建，利用 Bun 的高性能和跨平台特性

### 6. 类型安全问题

- **问题**：`useNativeLelwel` 函数仍使用 `any` 类型
- **修复**：使用泛型 `get<T>` 方法，增强类型安全
- **影响**：代码更类型安全，减少运行时错误

### 7. 错误处理不完整

- **问题**：`activate` 函数中的错误处理不够全面
- **修复**：添加更全面的错误处理，向用户显示友好的错误消息
- **影响**：用户可以看到更明确的错误信息，调试更容易

### 8. 测试资源问题

- **问题**：`testFixture/completion.llw` 内容简单，测试用例不全面
- **修复**：扩展测试用例文件，添加更多测试场景
- **影响**：测试更全面，可以覆盖更多语言特性

### 9. 测试路径问题

- **问题**：`src/test/helper.ts` 中的测试路径不正确
- **修复**：修正测试文件路径
- **影响**：集成测试可以正确找到测试文件

## 使用方法

### 开发环境设置

1. 安装 Bun（如果尚未安装）：

   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

2. 安装项目依赖：

   ```bash
   bun install
   ```

3. 构建 WASM 模块：
   ```bash
   bun run build-wasm
   ```

### 开发工作流

1. **开发模式**：

   ```bash
   bun run dev
   ```

2. **快速开发模式**（不清除控制台）：

   ```bash
   bun run dev:fast
   ```

3. **热重载模式**：
   ```bash
   bun run dev:hot
   ```

### 测试

1. **运行所有测试**：

   ```bash
   bun run test
   ```

2. **运行单元测试**：

   ```bash
   bun run test:unit
   ```

3. **运行集成测试**：

   ```bash
   bun run test:integration
   ```

4. **生成测试覆盖率报告**：
   ```bash
   bun run test:coverage:report
   ```

### 构建和打包

1. **开发构建**：

   ```bash
   bun run build:dev
   ```

2. **生产构建**：

   ```bash
   bun run build:production
   ```

3. **打包扩展**：
   ```bash
   bun run package
   ```

### 代码质量检查

1. **类型检查**：

   ```bash
   bun run type-check
   ```

2. **代码检查**：

   ```bash
   bun run lint
   ```

3. **自动修复代码问题**：

   ```bash
   bun run lint:fix
   ```

4. **代码格式化**：
   ```bash
   bun run format
   ```

## 调试

### VS Code 调试配置

项目已配置了以下调试选项：

1. **Run Extension**：调试扩展运行
2. **Extension Tests**：调试扩展测试
3. **Debug Bun Tests**：调试 Bun 单元测试
4. **Debug Bun Integration Tests**：调试 Bun 集成测试

### 调试步骤

1. 在 VS Code 中打开项目
2. 打开调试面板（Ctrl+Shift+D）
3. 选择适当的调试配置
4. 设置断点
5. 按 F5 开始调试

## 故障排除

### 测试覆盖率为 0

如果测试覆盖率仍然为 0，请检查：

1. 确保测试文件位于正确的目录：
   - 单元测试：`src/test/unit/`
   - 集成测试：`src/test/integration/`

2. 确保测试文件以 `.test.ts` 结尾

3. 检查 `bunfig.toml` 中的测试配置是否正确

### WASM 加载失败

如果 WASM 加载失败，请检查：

1. 确保 WASM 文件存在：

   ```bash
   ls -la server/lelwel-ls.wasm
   ```

2. 如果不存在，重新构建：

   ```bash
   bun run build-wasm
   ```

3. 检查 Rust 工具链是否正确安装

### 构建失败

如果构建失败，请检查：

1. 确保依赖已正确安装：

   ```bash
   bun install
   ```

2. 检查 TypeScript 类型错误：

   ```bash
   bun run type-check
   ```

3. 检查代码风格问题：
   ```bash
   bun run lint
   ```

## 性能优化

项目已包含以下性能优化：

1. **WASM 实例缓存**：避免重复加载 WASM 模块
2. **Bun 快速编译**：利用 Bun 的快速 WASM 编译（如果可用）
3. **并行构建**：使用 `concurrently` 并行执行构建任务
4. **代码分割**：生产构建启用代码分割

## 下一步

1. 尝试运行测试，确保所有测试通过
2. 使用开发模式进行功能开发
3. 使用调试配置进行问题排查
4. 定期运行代码质量检查

## Bun Shell API 优势

使用 Bun shell API 替代 Node.js API 的优势：

1. **跨平台兼容性**：Bun shell 在所有平台上提供一致的 API
2. **性能更高**：Bun 的内置操作比 Node.js 更快
3. **更简洁的语法**：使用 `--eval` 和 `await import()` 比复杂的 Node.js 脚本更简洁
4. **更好的错误处理**：Bun 提供更清晰的错误信息
5. **原生支持**：作为项目的运行时，Bun shell 与项目更紧密集成

## 资源

- [Bun 官方文档](https://bun.sh/docs)
- [Bun Shell 文档](https://bun.sh/docs/cli/shell)
- [VS Code 扩展开发指南](https://code.visualstudio.com/api)
- [WebAssembly 文档](https://webassembly.org/)
