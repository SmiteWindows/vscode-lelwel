# Bun 1.3.9 功能特性指南

本文档介绍如何利用 Bun 1.3.9 的新功能来增强 VS Code Lelwel 扩展。

## Bun 1.3.9 新功能概览

1. **内置数据库客户端** - 原生支持 SQLite 和其他数据库
2. **零配置前端开发** - 内置开发服务器和热重载
3. **增强的性能分析** - 更详细的性能分析工具
4. **改进的 Shell API** - 更强大的脚本和自动化能力
5. **优化的 WASM 支持** - 更快的 WASM 编译和加载

## 内置数据库客户端

Bun 1.3.9 提供了内置的数据库客户端，支持 SQLite 和其他数据库。

### 使用示例

```typescript
import { getDatabaseConnection, saveUserSetting, getUserSetting } from "./src/utils/database";

// 保存设置
await saveUserSetting("nativeLsp", true);

// 获取设置
const setting = await getUserSetting<boolean>("nativeLsp");
console.log(setting); // true
```

### 配置文件

在 `bunfig.toml` 中配置数据库连接：

```toml
[database]
type = "sqlite"
location = "./data/lelwel.db"
maxConnections = 10
```

## 零配置前端开发

Bun 1.3.9 提供了零配置的前端开发体验，无需额外配置即可启动开发服务器。

### 启动开发服务器

```bash
# 启动开发服务器
bun run dev:frontend

# 启动数据库和前端
bun run dev:database
```

### 热重载

Bun 自动检测文件变更并重新加载，无需手动刷新。

```typescript
import { startDevServer, startHotReload } from "./src/utils/frontend";

// 启动开发服务器
const server = await startDevServer();

// 启动热重载
const watcher = startHotReload();
```

## 性能分析

Bun 1.3.9 提供了增强的性能分析工具，可以更详细地分析代码性能。

### 性能监控

```typescript
import { performanceMonitor } from "./src/utils/performance";

// 监控函数性能
const { result, profile } = await performanceMonitor.profileFunction(myFunction, "my-function");

// 保存性能分析结果
await performanceMonitor.saveProfile("my-function", profile);

// 生成性能报告
const report = performanceMonitor.generateReport();
console.log(report);
```

### 性能配置

在 `bunfig.toml` 中配置性能分析：

```toml
[analyze]
bundleAnalysis = true
dependencyAnalysis = true
performanceProfiling = true
```

## Shell API 增强

Bun 1.3.9 提供了更强大的 Shell API，可以更轻松地编写跨平台脚本。

### 跨平台脚本

```bash
# 使用 Bun Shell API 创建目录
bun --eval 'if (!await import("fs").then(fs => fs.existsSync("server"))) await import("fs").then(fs => fs.mkdirSync("server", { recursive: true }));'

# 监听文件变更
bun --eval 'await import("fs").then(fs => { const watcher = fs.watch("src", { recursive: true }, (event, filename) => { console.log(`${event}: ${filename}`); }); })'
```

## 优化的 WASM 支持

Bun 1.3.9 提供了更快的 WASM 编译和加载，提高了语言服务器的性能。

### WASM 加载优化

```typescript
// 使用 Bun 的快速 WASM 编译
if (typeof Bun !== "undefined" && Bun.compile) {
  const module = await Bun.compile(wasmBytes);
  // 使用编译后的模块
}
```

## 测试增强

Bun 1.3.9 提供了增强的测试功能，支持内存数据库和更好的模拟。

### 测试数据库

```typescript
// 在测试中使用内存数据库
beforeAll(async () => {
  if (typeof Bun !== "undefined") {
    const testDb = new Bun.Database(":memory:");
    // 创建测试表和添加测试数据
    globalThis.testDb = testDb;
  }
});
```

## 最佳实践

1. **利用内置数据库客户端** - 减少外部依赖，提高性能
2. **使用零配置前端开发** - 加快开发速度，简化配置
3. **启用性能分析** - 定期分析代码性能，优化瓶颈
4. **使用 Shell API** - 编写跨平台脚本，提高兼容性
5. **优化 WASM 加载** - 利用 Bun 的快速 WASM 编译

## 迁移指南

### 从旧版本升级

1. 更新 `bun-types` 到 1.3.9
2. 添加数据库和前端相关脚本
3. 更新 `bunfig.toml` 配置
4. 使用新的性能监控功能

### 故障排除

#### 数据库连接问题

如果遇到数据库连接问题，请检查：

1. Bun 版本是否为 1.3.9 或更高
2. 数据库文件路径是否正确
3. 文件权限是否允许读写

#### 前端开发问题

如果前端开发服务器无法启动，请检查：

1. 端口是否被占用
2. 静态文件路径是否正确
3. 防火墙是否阻止连接

## 资源

- [Bun 1.3.9 官方文档](https://bun.sh/docs)
- [Bun 数据库文档](https://bun.sh/docs/database)
- [Bun 前端开发文档](https://bun.sh/docs/cli/dev)
- [Bun 性能分析文档](https://bun.sh/docs/profiling)
