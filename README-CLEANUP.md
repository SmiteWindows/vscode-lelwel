# 项目清理与重复问题解决

本文档总结了项目中发现的重复问题及其解决方案。

    "watch:wasm": "bun x watch lelwel/src --recursive --pattern='*.rs' --command='bun build-wasm'",
    "dev:hot": "bun build-wasm && bun concurrently 'bun --watch src/extension.ts --watch src/test/**/*.ts' 'bun watch:wasm'",
    "test": "bun test",
    "test:unit": "bun test src/test/unit/",
    "test:integration": "bun test src/test/integration/",
    "test:watch": "bun test --watch",
    "test:coverage": "bun test --coverage",
    "clean": "bun x rimraf dist server .tsbuildinfo coverage"
    这些脚本没成功

## 已解决的重复问题

### 1. package.json 中的重复脚本

**问题**：

- `dev:database` 脚本重复定义
- `dev:frontend` 脚本重复定义
- `db:migrate` 脚本重复定义
- `db:seed` 脚本重复定义
- `analyze` 脚本重复定义

**解决方案**：

- 合并重复脚本，使用统一的命名规范
- 将 `dev:database` 重命名为 `dev:db` 以避免冲突
- 将 `analyze:dependencies` 重命名为 `analyze:deps` 以保持简洁
- 添加 `db:migrate:up` 和 `db:migrate:down` 脚本，替代原有的 `db:migrate` 脚本

### 2. bunfig.toml 中的重复配置

**问题**：

- `[build]` 和 `[bundle]` 部分有重复的配置项
- `target`、`entrypoints` 在两个部分都定义

**解决方案**：

- 保留 `[build]` 部分的完整配置
- 在 `[bundle]` 部分只保留特定于捆绑的配置项（`external`、`format`、`bundle`）
- 移除重复的 `target` 和 `entrypoints` 配置

### 3. src/extension.ts 中的重复性能监控代码

**问题**：

- 文件中定义了本地 `performanceMonitor` 对象
- 同时也从 `./utils/performance` 导入了 `performanceMonitor`
- 两者功能重叠，造成代码重复

**解决方案**：

- 移除本地定义的 `performanceMonitor` 对象
- 统一使用从 `./utils/performance` 导入的 `performanceMonitor`
- 更新所有性能监控调用以使用导入的实例

### 4. src/extension.ts 中的重复数据库初始化代码

**问题**：

- `initializeDatabase` 函数中直接使用 Bun.Database
- 同时项目中有 `./utils/database.ts` 模块提供数据库功能
- 两者功能重叠，造成代码重复

**解决方案**：

- 重构 `initializeDatabase` 函数，使用 `./utils/database` 模块
- 移除直接的数据库操作代码
- 使用模块提供的 `initializeDatabase` 和 `saveUserSetting` 函数

### 5. 多个 README 文档的内容重叠

**问题**：

- 存在多个 README 文档：`README.md`、`README-BUN.md`、`README-BUN-OPTIMIZATION.md`、`README-BUN-FEATURES.md`
- 部分内容在多个文档中重复
- 文档结构不清晰，难以找到特定信息

**解决方案**：

- 保留 `README.md` 作为主要项目文档
- 使用 `README-BUN.md` 作为 Bun 工具链使用指南
- 使用 `README-BUN-OPTIMIZATION.md` 作为 Bun 优化方案指南
- 使用 `README-BUN-FEATURES.md` 作为 Bun 1.3.9 新功能指南
- 使用 `README-PROJECT-FIXES.md` 作为项目问题修复记录
- 明确各文档的用途，避免内容重复

## 代码组织改进

### 1. 模块化改进

- 将性能监控功能统一到 `src/utils/performance.ts`
- 将数据库操作统一到 `src/utils/database.ts`
- 将前端开发功能统一到 `src/utils/frontend.ts`

### 2. 配置文件优化

- `package.json`：统一脚本命名，避免重复
- `bunfig.toml`：合并重复配置，明确各部分用途
- `tsconfig.json`：保持 TypeScript 配置一致性

### 3. 测试结构优化

- 单元测试：`src/test/unit/`
- 集成测试：`src/test/integration/`
- 测试设置：`src/test/setup.ts`

## 命名规范

### 1. 脚本命名

- 使用 `:` 分隔符表示子命令（如 `db:migrate`）
- 使用 `:` 分隔符表示环境（如 `dev:db`）
- 使用简洁但有意义的名称（如 `analyze:deps` 而不是 `analyze:dependencies`）

### 2. 文件命名

- 工具模块：`src/utils/[功能名].ts`
- 测试文件：`[模块名].test.ts`
- 文档文件：`README-[主题].md`

## 最佳实践

1. **单一职责原则**：每个模块只负责一个特定功能
2. **避免重复**：使用导入和模块化，避免代码重复
3. **统一命名**：使用一致的命名规范
4. **文档分离**：不同主题的文档分开，避免内容重复
5. **配置集中**：相关配置集中在相应的配置文件中

## 后续维护建议

1. 定期检查代码重复
2. 保持文档更新，避免内容过时
3. 遵循已建立的命名规范
4. 在添加新功能时，优先考虑现有模块的扩展
5. 定期审查配置文件，确保配置的一致性

通过以上清理和优化，项目的代码结构更加清晰，重复内容减少，维护成本降低，开发效率提高。
