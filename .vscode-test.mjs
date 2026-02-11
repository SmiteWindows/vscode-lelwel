import { defineConfig } from "@vscode/test-cli";

export default defineConfig({
  files: "dist/test/**/*.test.js",
  mocha: {
    ui: "tdd",
    timeout: 20000,
  },
  // 添加对新版本 VSCode 测试的支持
  workspaceFolder: "./test-fixtures",
  // 启用更详细的测试输出
  verbose: true,
  // 并行运行测试
  parallel: true,
});
