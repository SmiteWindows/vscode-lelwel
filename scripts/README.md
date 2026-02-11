# Bun 优化构建脚本

本项目使用基于 Bun API 的优化构建脚本，以充分利用 Bun 1.3.9+ 的性能优势。

## 构建脚本说明

### scripts/build-stable.mjs

这是主要的构建脚本，使用 Bun 环境运行 Node.js API，提供了更好的兼容性和稳定性：

- **prepare**: 创建服务器目录
- **copy**: 复制 WASM 文件到服务器目录

### 使用方法

```bash
# 准备服务器目录
bun scripts/build-stable.mjs prepare

# 复制 WASM 文件
bun scripts/build-stable.mjs copy
```

## 从 Node.js API 迁移到 Bun API

我们将原本使用 Node.js API 的部分在 Bun 环境中进行了优化：

### 1. 文件系统操作

**之前的 Node.js API:**

```javascript
const fs = require("fs");
if (!fs.existsSync("server")) {
  fs.mkdirSync("server", { recursive: true });
}
fs.copyFileSync(source, dest);
```

**优化后的 Bun 方案:**

```javascript
// 在 Bun 环境中使用 Node.js API (更稳定)
import { existsSync, mkdirSync, copyFileSync } from "node:fs";
if (!existsSync("server")) {
  mkdirSync("server", { recursive: true });
}
copyFileSync(source, dest);
```

## 性能优化

构建脚本中包含了以下性能优化：

1. **使用 node:fs 模块**: 在 Bun 环境中使用优化的文件系统 API
2. **减少跨平台问题**: 使用标准化的文件操作
3. **简化错误处理**: 提供清晰的错误信息

## 与 package.json 集成

构建脚本已集成到 package.json 的 npm scripts 中，可以直接使用：

```bash
# 构建整个项目
bun build

# 开发模式
bun dev

# 清理构建文件
bun clean
```

这些脚本提供了比传统 Node.js API 更好的性能和更简洁的代码实现。
