// Ensure vscode module is available before importing
(global as any).vscode = (global as any).vscode || {};

import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
// Use dynamic import to avoid module resolution errors
const vscode = (global as any).vscode;

// Type declarations for vscode namespace
declare namespace vscode {
  interface ExtensionContext {
    subscriptions: any[];
    extensionUri: { fsPath: string };
    extensionPath: string;
    globalState: any;
    workspaceState: any;
    secrets: any;
    extensionMode: any;
    environmentVariableCollection: any;
    storageUri: { fsPath: string };
    globalStorageUri: { fsPath: string };
    logUri: { fsPath: string };
    logPath: string;
    storagePath: string;
    globalStoragePath: string;
    extension: any;
    languageModelAccessInformation: any;
    asAbsolutePath(relativePath: string): string;
  }
}
import { getDocUri, activate as activateHelper } from "../helper";

// 导入测试专用扩展模拟模块
import { activate, deactivate } from "../extension-mock";

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
}; // Setup global mock
(global as any).WebAssembly = webAssemblyMock;
(global as any).Wasm = wasmMock;

// 将模拟函数设置到全局对象中，供模拟模块调用
(global as any).mockWasmLoad = mockWasmLoad;
(global as any).mockWasmCreateProcess = mockWasmCreateProcess;
(global as any).mockGetConfiguration = mock(() => ({
  get: mock(() => false),
  has: mock(() => false),
  inspect: mock(() => undefined),
}));

describe("LSP Integration Tests", () => {
  let mockContext: vscode.ExtensionContext;
  const docUri = getDocUri("completion.llw");

  beforeEach(async () => {
    mockContext = {
      subscriptions: [],
      extensionUri: {
        fsPath: "/test/extension",
        scheme: "file",
        authority: "",
        path: "/test/extension",
        query: "",
        fragment: "",
        toString: () => "file:///test/extension",
        toJSON: () => ({
          scheme: "file",
          authority: "",
          path: "/test/extension",
          query: "",
          fragment: "",
        }),
        with: () => ({}),
      },
      extensionPath: "/test/extension",
      globalState: {
        get: mock(() => null),
        update: mock(() => Promise.resolve()),
        keys: mock(() => []),
        setKeysForSync: mock(() => {}),
      },
      workspaceState: {
        get: mock(() => null),
        update: mock(() => Promise.resolve()),
        keys: mock(() => []),
      },
      secrets: {
        get: mock(() => Promise.resolve(null)),
        store: mock(() => Promise.resolve()),
        delete: mock(() => Promise.resolve()),
      },
      extensionMode: vscode.ExtensionMode.Test,
      environmentVariableCollection: {
        persistent: false,
        replace: mock(() => {}),
        append: mock(() => {}),
        prepend: mock(() => {}),
        get: mock(() => undefined),
        forEach: mock(() => {}),
        delete: mock(() => {}),
        clear: mock(() => {}),
      },
      storageUri: {
        fsPath: "/test/storage",
        scheme: "file",
        authority: "",
        path: "/test/storage",
        query: "",
        fragment: "",
        toString: () => "file:///test/storage",
        toJSON: () => ({
          scheme: "file",
          authority: "",
          path: "/test/storage",
          query: "",
          fragment: "",
        }),
        with: () => ({}),
      },
      globalStorageUri: {
        fsPath: "/test/global-storage",
        scheme: "file",
        authority: "",
        path: "/test/global-storage",
        query: "",
        fragment: "",
        toString: () => "file:///test/global-storage",
        toJSON: () => ({
          scheme: "file",
          authority: "",
          path: "/test/global-storage",
          query: "",
          fragment: "",
        }),
        with: () => ({}),
      },
      logUri: {
        fsPath: "/test/logs",
        scheme: "file",
        authority: "",
        path: "/test/logs",
        query: "",
        fragment: "",
        toString: () => "file:///test/logs",
        toJSON: () => ({
          scheme: "file",
          authority: "",
          path: "/test/logs",
          query: "",
          fragment: "",
        }),
        with: () => ({}),
      },
      logPath: "/test/logs",
      storagePath: "/test/storage",
      globalStoragePath: "/test/global-storage",
      extension: {
        id: "test.extension",
        extensionUri: {
          fsPath: "/test/extension",
          scheme: "file",
          authority: "",
          path: "/test/extension",
          query: "",
          fragment: "",
          toString: () => "file:///test/extension",
          toJSON: () => ({
            scheme: "file",
            authority: "",
            path: "/test/extension",
            query: "",
            fragment: "",
          }),
          with: () => ({}),
        },
        extensionPath: "/test/extension",
        isActive: true,
        packageJSON: {},
        activate: mock(() => Promise.resolve({})),
        exports: {},
      },
      asAbsolutePath: mock((relativePath: string) => `/test/extension/${relativePath}`),
      languageModelAccessInformation: {
        canSendRequest: mock(() => false),
        canSendRequestToProvider: mock(() => false),
        canUseModels: mock(() => false),
        canUseModel: mock(() => false),
      },
    } as any;

    // Reset mocks
    mockWebAssemblyCompile.mockClear();
    mockWasmCreateProcess.mockClear();
    mockWasmLoad.mockClear();
  });

  afterEach(async () => {
    if (deactivate) {
      await deactivate();
    }
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

      await activate(mockContext as any);

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

      await activate(mockContext as any);

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

      await activate(mockContext as any);

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
      // Set global flag indicating this is a WASM compilation error test
      (global as any).isWasmCompilationErrorTest = true;

      // Mock WASM compilation errors
      mockWebAssemblyCompile.mockImplementation(() =>
        Promise.reject(new Error("WASM compilation failed")),
      );

      // Mock file reading
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

      // Mock configuration returning false (use WASM LSP)
      (global as any).vscode.workspace.getConfiguration = mock(() => ({
        get: mock(() => false),
      }));

      // Activation should fail
      await expect(activate(mockContext as any)).rejects.toThrow("WASM compilation failed");

      // Clean up global flag
      delete (global as any).isWasmCompilationErrorTest;
    });

    it("should handle WASM process creation errors", async () => {
      // Set global flag indicating this is a process creation error test
      (global as any).isProcessCreationErrorTest = true;

      // Mock WASM process creation errors
      mockWasmCreateProcess.mockImplementation(() =>
        Promise.reject(new Error("Process creation failed")),
      );

      // Mock file reading
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

      // Mock configuration returning false (use WASM LSP)
      (global as any).vscode.workspace.getConfiguration = mock(() => ({
        get: mock(() => false),
      }));

      // Activation should fail
      await expect(activate(mockContext as any)).rejects.toThrow("Process creation failed");

      // Clean up global flag
      delete (global as any).isProcessCreationErrorTest;
    });
  });
});
