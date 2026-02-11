// 导入共享的 VS Code 模拟
import "./global-setup";

import { beforeAll, afterAll, beforeEach, afterEach } from "bun:test";
import * as vscode from "vscode";

// 存储原始的全局变量，以便测试后恢复
const originalGlobals = {
  vscode: (global as any).vscode,
  WebAssembly: (global as any).WebAssembly,
  Wasm: (global as any).Wasm,
  process: { ...process.env },
};

// 全局测试设置
beforeAll(async () => {
  // 设置测试环境变量
  process.env.NODE_ENV = "test";
  process.env.BUN_ENV = "test";

  // 模拟 WebAssembly API
  (global as any).WebAssembly = {
    compile: () => Promise.resolve({}),
    instantiate: () => Promise.resolve({}),
    Module: class {},
    Instance: class {},
  };

  // 模拟 WASM WASI 模块
  (global as any).Wasm = {
    load: () =>
      Promise.resolve({
        createProcess: () =>
          Promise.resolve({
            stderr: {
              onData: () => {},
            },
            run: () => Promise.resolve({ exitCode: 0 }),
          }),
      }),
  };

  // 使用内存存储代替数据库
  (global as any).testStorage = new Map();
  (global as any).testStorage.set("testSetting", JSON.stringify({ enabled: true }));
});

afterAll(async () => {
  // 恢复全局状态
  (global as any).vscode = originalGlobals.vscode;
  (global as any).WebAssembly = originalGlobals.WebAssembly;
  (global as any).Wasm = originalGlobals.Wasm;
  process.env = originalGlobals.process;

  // 清理测试存储
  (global as any).testStorage?.clear();
  delete (global as any).testStorage;
});

beforeEach(() => {
  // 每个测试前的设置
});

afterEach(() => {
  // 每个测试后的清理
  // 清除任何可能被修改的模拟函数
  if ((global as any).vscode) {
    const vscode = (global as any).vscode;
    if (vscode.window && vscode.window.showInformationMessage) {
      vscode.window.showInformationMessage.mockClear?.();
    }
    if (vscode.workspace && vscode.workspace.getConfiguration) {
      vscode.workspace.getConfiguration.mockClear?.();
    }
  }
});
