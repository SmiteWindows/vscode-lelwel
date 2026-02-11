# Bun 优化方案使用指南

本文档说明如何使用 Bun 的优化功能来提高 VS Code Lelwel 扩展的开发效率和性能。

## 快速开始

### 安装 Bun

```bash
# 在 Windows 上使用 PowerShell pwsh
curl -fsSL https://bun.sh/install | bash

# 或者使用 npm
npm install -g bun
```

### 安装依赖

```bash
# 使用 Bun 安装依赖（比 npm 快 10-100 倍）
bun install
```

## 开发工作流

### 开发模式

```bash
# 快速开发模式，支持热重载
bun run dev

# 更快的开发模式，不清除控制台
bun run dev:fast

# 调试模式
bun run dev:debug
```

### 构建和测试

```bash
# 生产构建
bun run build:production

# 开发构建
bun run build:dev

# 并行构建（利用 Bun 的并发能力）
bun run build:parallel

# 运行单元测试
bun run test:unit

# 运行集成测试
bun run test:integration

# 运行所有测试
bun run test

# 运行测试并生成覆盖率报告
bun run test:coverage:report

# 并行运行测试
bun run test:parallel
```

### 性能分析

```bash
# 分析构建性能
bun run perf:build

# 分析测试性能
bun run perf:test
```

## Bun 配置

项目使用 `bunfig.toml` 进行全局配置，包括：

- **构建配置**：自动代码分割、树摇优化、最小化
- **测试配置**：覆盖率阈值、并行测试、测试环境变量
- **加载器配置**：TypeScript、JavaScript、JSON 和 WASM 文件处理

## 测试策略

### 单元测试

单元测试位于 `src/test/unit/` 目录，使用 Bun 的内置测试运行器。特点：

- 快速执行（比 Jest 快 2-3 倍）
- 内置模拟功能
- TypeScript 支持

### 集成测试

集成测试位于 `src/test/integration/` 目录，测试 LSP 功能。特点：

- 模拟 VS Code API
- 测试 WASM 和原生 LSP
- 测试代码补全功能

### 测试覆盖率

```bash
# 生成覆盖率报告
bun run test:coverage

# 生成 HTML 覆盖率报告
bun run test:coverage:report
```

覆盖率报告将生成在 `coverage/` 目录中。

## 性能优化

### WASM 优化

扩展使用优化的 WASM 加载函数：

- 利用 Bun 的快速 WASM 编译
- WASM 实例缓存
- 错误处理和回退机制

### 性能监控

使用内置的性能监控工具：

```typescript
import { performanceMonitor, measurePerformance } from './utils/performance';

// 手动监控
performanceMonitor.startTimer('operation');
// ... 执行操作
const duration = performanceMonitor.endTimer('operation');

// 使用装饰器
@measurePerformance('expensive-operation')
async function expensiveOperation() {
  // ... 耗时操作
}
```

## 故障排除

### 测试覆盖率为 0

如果测试覆盖率为 0，请检查：

1. 测试文件是否位于正确的目录（`src/test/unit/` 或 `src/test/integration/`）
2. 测试文件是否以 `.test.ts` 或 `.spec.ts` 结尾
3. 是否正确导入了测试函数

### WASM 加载失败

如果 WASM 加载失败，请检查：

1. `server/lelwel-ls.wasm` 文件是否存在
2. WASM 文件是否正确编译
3. 内存设置是否正确（初始内存和最大内存）

### 构建错误

如果构建失败，请检查：

1. 依赖是否正确安装（运行 `bun install`）
2. TypeScript 类型是否正确（运行 `bun run type-check`）
3. 代码是否符合 linting 规则（运行 `bun run lint`）

## 高级用法

### 自定义测试环境

可以在 `src/test/setup.ts` 中自定义测试环境：

```typescript
import { beforeAll, afterAll } from "bun:test";

beforeAll(() => {
  // 设置测试环境
});

afterAll(() => {
  // 清理测试环境
});
```

### 并发构建

利用 Bun 的并发能力进行并行构建：

```bash
# 并行构建 WASM 和 TypeScript
bun run build:parallel
```

### 性能分析

使用 Bun 的内置性能分析：

```bash
# 分析构建性能
bun run perf:build

# 分析测试性能
bun run perf:test
```

## 下一步

1. 尝试使用 Bun 的其他功能，如内置数据库客户端
2. 探索 Bun 的插件系统，扩展构建和测试功能
3. 使用 Bun 的部署功能，简化发布流程

## 资源

- [Bun 官方文档](https://bun.sh/docs)
- [Bun 测试文档](https://bun.sh/docs/test)
- [Bun 构建文档](https://bun.sh/docs/bundler)
