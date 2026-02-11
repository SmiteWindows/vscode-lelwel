# Bun Shell 使用指南

本文档介绍如何在 VS Code Lelwel 扩展项目中使用 Bun Shell API 替代传统的 Node.js 脚本。

## 什么是 Bun Shell

Bun Shell 是 Bun 1.3.9+ 中内置的跨平台 shell 工具，提供了一致的 API 来执行 shell 命令，解决了在不同操作系统上的兼容性问题。

## 为什么使用 Bun Shell

1. **跨平台兼容性**：在 Windows、macOS 和 Linux 上提供一致的 API
2. **性能更高**：Bun Shell 比 Node.js 的 `child_process` 更快
3. **更简洁的语法**：使用 `bun shell` 命令比复杂的 Node.js 脚本更简洁
4. **更好的错误处理**：Bun 提供更清晰的错误信息
5. **原生支持**：作为项目的运行时，Bun Shell 与项目更紧密集成

## 项目中的 Bun Shell 使用

### WASM 构建脚本

#### 原始版本（使用 Node.js API）

```json
{
  "build-wasm:prepare": "bun --eval 'if (!await import(\"fs\").then(fs => fs.existsSync(\"server\"))) await import(\"fs\").then(fs => fs.mkdirSync(\"server\", { recursive: true }));'",
  "build-wasm:copy": "bun --eval 'await import(\"fs\").then(fs => fs.copyFileSync(\"lelwel/target/wasm32-wasip1-threads/release/lelwel-ls.wasm\", \"server/lelwel-ls.wasm\"))'",
  "watch:wasm": "bun --eval 'await import(\"fs\").then(fs => { const watcher = fs.watch(\"lelwel/src\", { recursive: true }, (eventType, filename) => { if (filename && filename.endsWith(\".rs\")) { console.log(\"WASM source changed, rebuilding...\"); Bun.spawn([\"bun\", \"run\", \"build-wasm\"], { onExit: (code, signal) => { if (code !== 0) console.error(\`WASM build failed with code ${code}\`); } }); } }); })'"
}
```

#### 优化版本（使用 Bun Shell）

```json
{
  "build-wasm:prepare": "bun shell 'if [ ! -d server ]; then mkdir -p server; fi'",
  "build-wasm:copy": "bun shell 'cp lelwel/target/wasm32-wasip1-threads/release/lelwel-ls.wasm server/lelwel-ls.wasm'",
  "watch:wasm": "bun shell 'watch lelwel/src --recursive --pattern="*.rs" --command="bun run build-wasm"'"
}
```

### 清理脚本

#### 原始版本

```json
{
  "clean": "rm -rf dist server .tsbuildinfo coverage"
}
```

#### 优化版本（使用 Bun Shell）

```json
{
  "clean": "bun shell 'rm -rf dist server .tsbuildinfo coverage'"
}
```

### 数据库相关脚本

#### 原始版本

```json
{
  "dev:db": "bun --watch src/database --hot",
  "dev:frontend": "bun --watch src/frontend --hot",
  "db:migrate:up": "bun run db:migrate --up",
  "db:migrate:down": "bun run db:migrate --down",
  "db:reset": "bun run db:migrate:down && bun run db:migrate:up"
}
```

#### 优化版本（使用 Bun Shell）

```json
{
  "dev:db": "bun shell 'bun --watch src/database --hot'",
  "dev:frontend": "bun shell 'bun --watch src/frontend --hot'",
  "db:migrate:up": "bun shell 'bun run db:migrate --up'",
  "db:migrate:down": "bun shell 'bun run db:migrate --down'",
  "db:reset": "bun shell 'bun run db:migrate:down && bun run db:migrate:up'"
}
```

## Bun Shell 语法示例

### 文件操作

```bash
# 创建目录
bun shell 'mkdir -p path/to/directory'

# 复制文件
bun shell 'cp source/file destination/file'

# 移动文件
bun shell 'mv source/file destination/file'

# 删除文件和目录
bun shell 'rm -rf directory'
```

### 文件监听

```bash
# 监听文件变化
bun shell 'watch src --recursive --pattern="*.ts" --command="bun run build"'

# 监听特定文件
bun shell 'watch src/index.ts --command="bun run build"'
```

### 条件执行

```bash
# 条件创建目录
bun shell 'if [ ! -d directory ]; then mkdir -p directory; fi'

# 条件执行命令
bun shell 'if [ -f file.txt ]; then cat file.txt; fi'
```

### 管道和重定向

```bash
# 管道操作
bun shell 'cat file.txt | grep "pattern"'

# 输出重定向
bun shell 'echo "Hello" > file.txt'

# 错误重定向
bun shell 'command 2> error.log'
```

## 最佳实践

1. **使用单引号**：在 shell 命令中使用单引号，避免转义问题
2. **保持简洁**：使用 Bun Shell 的简洁语法，避免复杂的 Node.js 脚本
3. **错误处理**：利用 Bun Shell 的内置错误处理
4. **跨平台兼容**：使用 POSIX 兼容的命令，Bun Shell 会在不同平台上自动转换
5. **性能考虑**：对于简单操作，Bun Shell 比 Node.js API 更快

## 故障排除

### 常见问题

1. **命令不执行**：检查命令语法，确保使用正确的引号
2. **路径问题**：使用相对路径或绝对路径，避免路径解析问题
3. **权限问题**：确保有足够的权限执行文件操作
4. **Windows 兼容性**：Bun Shell 会自动转换 POSIX 命令到 Windows 命令

### 调试技巧

```bash
# 启用详细输出
bun shell --verbose 'command'

# 显示执行的命令
bun shell --debug 'command'

# 检查命令执行结果
echo $?  # 检查上一个命令的退出码
```

## 迁移指南

### 从 Node.js API 迁移到 Bun Shell

#### 文件操作

```javascript
// Node.js API
if (!fs.existsSync('server')) {
  fs.mkdirSync('server', { recursive: true });
}

// Bun Shell
bun shell 'if [ ! -d server ]; then mkdir -p server; fi'
```

#### 文件监听

```javascript
// Node.js API
const watcher = fs.watch('src', { recursive: true }, (eventType, filename) => {
  if (filename && filename.endsWith('.rs')) {
    console.log('WASM source changed, rebuilding...');
    Bun.spawn(['bun', 'run', 'build-wasm'], { onExit: (code, signal) => {
      if (code !== 0) console.error(`WASM build failed with code ${code}`);
    } });
  }
});

// Bun Shell
bun shell 'watch src --recursive --pattern="*.rs" --command="bun run build-wasm"'
```

## 资源

- [Bun Shell 官方文档](https://bun.sh/docs/cli/shell)
- [Bun Shell API 参考](https://bun.sh/docs/api/shell)
- [Bun 1.3.9 发布说明](https://bun.sh/blog/bun-v1.3.9)
