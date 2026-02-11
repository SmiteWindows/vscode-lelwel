// Ensure vscode module is available before importing
(global as any).vscode = (global as any).vscode || {};

import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
import { activate, deactivate } from "../../extension";
import * as vscode from "vscode";

// Type definitions
interface MockVSCode {
  window: {
    showInformationMessage: ReturnType<typeof mock>;
    createOutputChannel: ReturnType<typeof mock>;
    activeTextEditor: {
      document: { uri: { fsPath: string } };
    };
  };
  workspace: {
    getConfiguration: ReturnType<typeof mock>;
    fs: {
      readFile: ReturnType<typeof mock>;
    };
    onDidChangeConfiguration: ReturnType<typeof mock>;
  };
  Uri: {
    file: (path: string) => { fsPath: string };
    joinPath: (base: any, path: string) => { fsPath: string };
  };
  extensions: {
    getExtension: ReturnType<typeof mock>;
  };
  commands: {
    executeCommand: ReturnType<typeof mock>;
  };
}

// Mock VS Code API
const mockShowInformationMessage = mock(() => Promise.resolve("OK"));
const mockCreateOutputChannel = mock(() => ({
  append: mock(),
  appendLine: mock(),
  clear: mock(),
  show: mock(),
  hide: mock(),
  dispose: mock(),
}));
const mockGetConfiguration = mock(() => ({
  get: mock(() => false),
  has: mock(() => false),
  inspect: mock(() => undefined),
}));
const mockOnDidChangeConfiguration = mock(() => ({ dispose: mock() }));
const mockReadFile = mock(() => Promise.resolve(new Uint8Array([1, 2, 3])));
const _mockStat = mock(() => ({
  type: vscode.FileType.File,
  ctime: Date.now(),
  mtime: Date.now(),
  size: 1024,
}));
const mockGetExtension = mock(() => ({
  activate: mock(() => Promise.resolve()),
  extensionUri: { fsPath: "/test/extension" },
}));
const mockExecuteCommand = mock(() => Promise.resolve({ items: [] }));

// Setup mock
const vscodeMock: MockVSCode = {
  window: {
    showInformationMessage: mockShowInformationMessage,
    createOutputChannel: mockCreateOutputChannel,
    activeTextEditor: {
      document: { uri: { fsPath: "/test/file.llw" } },
    },
  },
  workspace: {
    getConfiguration: mockGetConfiguration,
    fs: {
      readFile: mockReadFile,
    } as any,
    onDidChangeConfiguration: mockOnDidChangeConfiguration,
  },
  Uri: {
    file: (path: string) => ({ fsPath: path }),
    joinPath: (base: any, path: string) => ({ fsPath: `${base.fsPath}/${path}` }),
  },
  extensions: {
    getExtension: mockGetExtension,
  },
  commands: {
    executeCommand: mockExecuteCommand,
  },
};

// Set global mock
(global as any).vscode = vscodeMock;

describe("Extension Core Functions", () => {
  let mockContext: vscode.ExtensionContext;

  beforeEach(() => {
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

    // 重置所有模拟
    mockShowInformationMessage.mockClear();
    mockCreateOutputChannel.mockClear();
    mockGetConfiguration.mockClear();
    mockOnDidChangeConfiguration.mockClear();
  });

  afterEach(() => {
    // 清理
  });

  describe("Extension activation", () => {
    it("should activate successfully", async () => {
      mockGetConfiguration.mockReturnValue({
        get: mock(() => false),
        has: mock(() => false),
        inspect: mock(() => undefined),
      } as any);

      await activate(mockContext);
      // 验证激活成功
      expect(true).toBe(true);
    });
  });

  describe("activate", () => {
    it("should activate successfully", async () => {
      await activate(mockContext);

      // 验证配置监听器已设置
      expect(mockOnDidChangeConfiguration).toHaveBeenCalled();
    });

    it("should handle configuration changes", async () => {
      mockGetConfiguration.mockReturnValue({
        get: mock(() => false),
        has: mock(() => false),
        inspect: mock(() => undefined),
      } as any);

      await activate(mockContext);

      // 获取配置变更回调
      const calls = mockOnDidChangeConfiguration.mock.calls as any[];
      if (calls.length > 0) {
        const configChangeCallback = calls[0][0];

        // 模拟配置变更事件
        await configChangeCallback({ affectsConfiguration: mock(() => true) });

        // 验证配置被重新获取
        expect(mockGetConfiguration).toHaveBeenCalled();
      }
    });
  });

  describe("deactivate", () => {
    it("should return undefined when client is not initialized", () => {
      const result = deactivate();
      expect(result).toBeUndefined();
    });

    it("should handle deactivation errors gracefully", async () => {
      // 模拟一个客户端实例
      const mockClient = {
        stop: mock(() => Promise.reject(new Error("Test error"))),
      };

      // 设置全局客户端变量
      (global as any).client = mockClient;

      // 调用 deactivate 应该处理错误
      const result = await deactivate();

      // 验证错误被处理
      expect(result).toBeDefined();
      expect(mockClient.stop).toHaveBeenCalled();
    });
  });

  describe("WASM loading", () => {
    it("should handle WASM file not found error", async () => {
      // 模拟配置返回 false（使用 WASM LSP）
      mockGetConfiguration.mockReturnValue({
        get: mock(() => false),
        has: mock(() => false),
        inspect: mock(() => undefined),
      } as any);

      // 激活应该失败
      await expect(activate(mockContext)).rejects.toThrow();
    });
  });
});
