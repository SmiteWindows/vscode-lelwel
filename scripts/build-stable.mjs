#!/usr/bin/env bun

// 简化版构建脚本，使用稳定的 Bun API

import { existsSync, mkdirSync, copyFileSync } from "node:fs";
import { join } from "node:path";

// 使用 Node.js API 但在 Bun 环境中运行
// 这样可以获得更好的兼容性和稳定性

// 准备服务器目录
function prepareServerDir() {
  const serverDir = join(process.cwd(), "server");
  if (!existsSync(serverDir)) {
    mkdirSync(serverDir, { recursive: true });
    console.log("Created server directory");
  }
}

// 复制 WASM 文件
function copyWasmFile() {
  const sourcePath = join(
    process.cwd(),
    "lelwel/target/wasm32-wasip2/release/lelwel-ls.wasm",
  );
  const destPath = join(process.cwd(), "server/lelwel-ls.wasm");

  if (existsSync(sourcePath)) {
    copyFileSync(sourcePath, destPath);
    console.log(`Copied WASM file from ${sourcePath} to ${destPath}`);
  } else {
    console.error(`WASM file not found at ${sourcePath}`);
    process.exit(1);
  }
}

// 主函数
async function main() {
  const command = process.argv[2];

  try {
    switch (command) {
      case "prepare":
        prepareServerDir();
        break;
      case "copy":
        copyWasmFile();
        break;
      default:
        console.error("Unknown command");
        console.log("Available commands: prepare, copy");
        process.exit(1);
    }
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
