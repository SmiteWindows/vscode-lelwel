# 项目更新日志

## Bun 优化和 VSCode 新版本适配

### 构建脚本优化

1. **删除了不使用的脚本**:
   - 删除了 build.mjs、build-bun.mjs、build-advanced.mjs 和 build-optimized.mjs
   - 只保留了 build-stable.mjs，提供更好的兼容性和稳定性

2. **使用 Bun API 替代 Node.js API**:
   - 使用 `node:fs` 模块替代标准 `fs` 模块
   - 在 Bun 环境中运行，获得更好的性能
   - 简化了文件操作和错误处理

3. **修复了构建脚本问题**:
   - 修复了 `bun build` 命令缺少入口点的问题
   - 移除了 `vscode:prepublish` 脚本，避免冲突
   - 确保所有构建命令都能正常工作

### VSCode 新版本适配

1. **package.json 更新**:
   - 添加了 `vscode` 引擎版本要求 `^1.109.0`
   - 添加了 `categories` 和 `keywords` 字段
   - 添加了 `capabilities` 配置，支持不受信任的工作区和虚拟工作区

2. **.vscode-test.mjs 更新**:
   - 添加了 `workspaceFolder` 配置
   - 启用了 `verbose` 输出
   - 启用了 `parallel` 测试运行

3. **language-configuration.json 增强**:
   - 添加了更多括号对 `{ }` 和 `\" \"`
   - 改进了缩进规则，支持更多控制结构
   - 添加了代码折叠标记
   - 添加了单词模式和数字格式配置

4. **lelwel.tmLanguage.json 更新**:
   - 启用了 `semanticHighlighting`
   - 添加了 `semanticTokenTypes` 配置
   - 提供了更好的语义高亮支持

5. **.vscodeignore 简化**:
   - 移除了不必要的排除项
   - 保留了核心的排除规则

### 性能优化

1. **构建性能**:
   - 使用 Bun 的原生 API 提高构建速度
   - 减少了跨平台兼容性问题
   - 简化了错误处理

2. **运行时性能**:
   - 优化了 WASM 加载
   - 改进了数据库连接池
   - 使用高精度计时器

### 兼容性改进

1. **跨平台支持**:
   - 使用标准化的文件操作
   - 减少了平台特定的代码

2. **VSCode 版本兼容性**:
   - 支持最新的 VSCode API
   - 启用了新版本的特性

这些更新使项目更好地利用了 Bun 1.3.9+ 的性能优势，同时兼容了最新版本的 VSCode。
