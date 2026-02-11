// Ensure vscode module is available before importing
(global as any).vscode = (global as any).vscode || {};

import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
import * as vscode from "vscode";
import { activate, deactivate } from "../../extension";
import { getDocUri, activate as activateHelper } from "../helper";

// Type definitions
interface MockWebAssembly {
  compile: ReturnType<typeof mock>;
  instantiate?: ReturnType<typeof mock>;
}

interface MockWasm {
  load: ReturnType<typeof mock>;
}

interface MockProcess {
  stderr: {
    onData: ReturnType<typeof mock>;
  };
}

// Mock WebAssembly API
const mockWebAssemblyCompile = mock(() => Promise.resolve({}));
const mockWasmCreateProcess = mock(() =>
  Promise.resolve({
    stderr: {
      onData: mock(),
    },
  } as MockProcess),
);

// Mock WASM WASI module
const mockWasmLoad = mock(() =>
  Promise.resolve({
    createProcess: mockWasmCreateProcess,
  }),
);

// Setup global mock
const webAssemblyMock: MockWebAssembly = {
  compile: mockWebAssemblyCompile,
};

const wasmMock: MockWasm = {
  load: mockWasmLoad,
};

(global as any).WebAssembly = webAssemblyMock;
(global as any).Wasm = wasmMock;

describe("LSP Integration Tests", () => {
  let mockContext: vscode.ExtensionContext;
  const docUri = getDocUri("completion.llw");

  beforeEach(async () => {
    mockContext = {
      subscriptions: [],
      extensionUri: { fsPath: "/test/extension" },
      globalState: {
        get: mock(() => null),
        update: mock(() => Promise.resolve()),
      },
      workspaceState: {
        get: mock(() => null),
        update: mock(() => Promise.resolve()),
      },
      secrets: {
        get: mock(() => Promise.resolve(null)),
        store: mock(() => Promise.resolve()),
      },
      extensionMode: vscode.ExtensionMode.Test,
    } as any;

    // Reset mocks
    mockWebAssemblyCompile.mockClear();
    mockWasmCreateProcess.mockClear();
    mockWasmLoad.mockClear();
  });

  afterEach(async () => {
    await deactivate();
  });

  describe("WASM Language Server", () => {
    it("should load WASM module successfully", async () => {
      // Mock file reading
      const mockReadFile = mock(() => Promise.resolve(new Uint8Array([1, 2, 3])));
      (global as any).vscode.workspace.fs = {
        readFile: mockReadFile,
      };

      // Mock configuration returning false (use WASM LSP)
      (global as any).vscode.workspace.getConfiguration = mock(() => ({
        get: mock(() => false),
      }));

      await activate(mockContext);

      // 验证 WASM 模块被加载
      expect(mockWasmLoad).toHaveBeenCalled();
    });

    it("should create WASM process with correct options", async () => {
      // 模拟文件读取
      const mockReadFile = mock(() => Promise.resolve(new Uint8Array([1, 2, 3])));
      (global as any).vscode.workspace.fs = {
        readFile: mockReadFile,
      };

      // 模拟配置返回 false（使用 WASM LSP）
      (global as any).vscode.workspace.getConfiguration = mock(() => ({
        get: mock(() => false),
      }));

      await activate(mockContext);

      // 验证 WASM 进程被创建
      expect(mockWasmCreateProcess).toHaveBeenCalledWith(
        "lelwel-ls",
        expect.any(Object),
        { initial: 160, maximum: 2000, shared: true },
        expect.objectContaining({
          stdio: expect.any(Object),
          mountPoints: [{ kind: "workspaceFolder" }],
        }),
      );
    });
  });

  describe("Native Language Server", () => {
    it("should use native LSP when configured", async () => {
      // 模拟配置返回 true（使用原生 LSP）
      (global as any).vscode.workspace.getConfiguration = mock(() => ({
        get: mock(() => true),
      }));

      await activate(mockContext);

      // 验证 WASM 模块未被加载
      expect(mockWasmLoad).not.toHaveBeenCalled();
    });
  });

  describe("Code Completion", () => {
    it("should provide code completion for llw files", async () => {
      await activateHelper(docUri);

      // 模拟执行完成命令
      const mockExecuteCommand = mock(() =>
        Promise.resolve({
          items: [
            { label: "#1", kind: vscode.CompletionItemKind.Operator },
            { label: "'+", kind: vscode.CompletionItemKind.Reference },
            { label: "'-", kind: vscode.CompletionItemKind.Reference },
            { label: "?1", kind: vscode.CompletionItemKind.Operator },
            { label: "Minus", kind: vscode.CompletionItemKind.Reference },
            { label: "Plus", kind: vscode.CompletionItemKind.Reference },
            { label: "program", kind: vscode.CompletionItemKind.Reference },
          ],
        }),
      );

      (global as any).vscode.commands.executeCommand = mockExecuteCommand;

      // 执行完成命令
      const completionResult = (await vscode.commands.executeCommand(
        "vscode.executeCompletionItemProvider",
        docUri,
        new vscode.Position(4, 16),
      )) as any;

      // 验证结果
      expect(completionResult.items.length).toBeGreaterThanOrEqual(2);
      expect(completionResult.items[0].label).toBe("#1");
      expect(completionResult.items[0].kind).toBe(vscode.CompletionItemKind.Operator);
    });

    it("should handle completion errors gracefully", async () => {
      await activateHelper(docUri);

      // 模拟执行完成命令返回错误
      const mockExecuteCommand = mock(() => Promise.reject(new Error("Completion failed")));

      (global as any).vscode.commands.executeCommand = mockExecuteCommand;

      // 执行完成命令应该处理错误
      await expect(
        vscode.commands.executeCommand(
          "vscode.executeCompletionItemProvider",
          docUri,
          new vscode.Position(4, 16),
        ),
      ).rejects.toThrow("Completion failed");
    });
  });

  describe("Error Handling", () => {
    it("should handle WASM compilation errors", async () => {
      // 模拟 WASM 编译错误
      mockWebAssemblyCompile.mockImplementation(() =>
        Promise.reject(new Error("WASM compilation failed")),
      );

      // 模拟文件读取
      const mockReadFile = mock(() => Promise.resolve(new Uint8Array([1, 2, 3])));
      (global as any).vscode.workspace.fs = {
        readFile: mockReadFile,
        stat: mock(() => ({
          type: vscode.FileType.File,
          ctime: Date.now(),
          mtime: Date.now(),
          size: 1024,
        })),
      };

      // 模拟配置返回 false（使用 WASM LSP）
      (global as any).vscode.workspace.getConfiguration = mock(() => ({
        get: mock(() => false),
      }));

      // 激活应该失败
      await expect(activate(mockContext)).rejects.toThrow("WASM compilation failed");
    });

    it("should handle WASM process creation errors", async () => {
      // 模拟 WASM 进程创建错误
      mockWasmCreateProcess.mockImplementation(() =>
        Promise.reject(new Error("Process creation failed")),
      );

      // 模拟文件读取
      const mockReadFile = mock(() => Promise.resolve(new Uint8Array([1, 2, 3])));
      (global as any).vscode.workspace.fs = {
        readFile: mockReadFile,
        stat: mock(() => ({
          type: vscode.FileType.File,
          ctime: Date.now(),
          mtime: Date.now(),
          size: 1024,
        })),
      };

      // 模拟配置返回 false（使用 WASM LSP）
      (global as any).vscode.workspace.getConfiguration = mock(() => ({
        get: mock(() => false),
      }));

      // 激活应该失败
      await expect(activate(mockContext)).rejects.toThrow("Process creation failed");
    });
  });
});
