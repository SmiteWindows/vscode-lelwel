// 全局设置文件 - 在任何测试文件导入之前执行
// 创建完整的 VS Code API 模拟
if (!(global as any).vscode) {
  // 模拟 path 模块
  const path = {
    resolve: (...paths: string[]) => paths.join("/").replace(/\/+/g, "/"),
    join: (...paths: string[]) => paths.join("/").replace(/\/+/g, "/"),
    dirname: (p: string) => p.substring(0, p.lastIndexOf("/")),
    basename: (p: string) => p.substring(p.lastIndexOf("/") + 1),
    extname: (p: string) => {
      const base = p.substring(p.lastIndexOf("/") + 1);
      const dotIndex = base.lastIndexOf(".");
      return dotIndex > 0 ? base.substring(dotIndex) : "";
    },
  };

  function createVSCodeMock() {
    const mockShowInformationMessage = () => Promise.resolve("");
    const mockCreateOutputChannel = () => ({
      append: () => {},
      appendLine: () => {},
      clear: () => {},
      show: () => {},
      hide: () => {},
      dispose: () => {},
    });
    const mockGetConfiguration = () => ({
      get: () => false,
      has: () => false,
      inspect: () => undefined,
    });
    const mockOnDidChangeConfiguration = () => ({ dispose: () => {} });
    const mockReadFile = () => Promise.resolve(new Uint8Array([1, 2, 3]));
    const mockExecuteCommand = () => Promise.resolve({ items: [] });
    const mockGetExtension = () => ({
      activate: () => Promise.resolve(),
      extensionUri: { fsPath: "/test/extension" },
    });

    return {
      version: "1.109.0",
      window: {
        showInformationMessage: mockShowInformationMessage,
        createOutputChannel: mockCreateOutputChannel,
        activeTextEditor: {
          document: {
            uri: { fsPath: "/test/file.llw" },
            languageId: "lelwel",
            getText: () => "",
            positionAt: () => ({ line: 0, character: 0 }),
          },
          selection: {
            start: { line: 0, character: 0 },
            end: { line: 0, character: 0 },
          },
        },
        showTextDocument: () =>
          Promise.resolve({
            edit: () => Promise.resolve(true),
            document: { getText: () => "" },
          }),
      },
      workspace: {
        getConfiguration: mockGetConfiguration,
        fs: {
          readFile: mockReadFile,
        },
        onDidChangeConfiguration: mockOnDidChangeConfiguration,
        workspaceFolders: [{ uri: { fsPath: "/test/workspace" } }],
        openTextDocument: () =>
          Promise.resolve({
            getText: () => "",
            positionAt: () => ({ line: 0, character: 0 }),
          }),
      },
      Uri: {
        file: (path: string) => ({
          fsPath: path,
          scheme: "file",
          authority: "",
          path: path,
          query: "",
          fragment: "",
          toString: () => `file://${path}`,
          toJSON: () => ({ scheme: "file", authority: "", path: path, query: "", fragment: "" }),
          with: (change: {
            scheme?: string;
            authority?: string;
            path?: string;
            query?: string;
            fragment?: string;
          }) => ({
            fsPath: change.path || path,
            scheme: change.scheme || "file",
            authority: change.authority || "",
            path: change.path || path,
            query: change.query || "",
            fragment: change.fragment || "",
            toString: () =>
              `${change.scheme || "file"}://${change.authority || ""}${change.path || path}${change.query ? `?${change.query}` : ""}${change.fragment ? `#${change.fragment}` : ""}`,
            toJSON: () => ({
              scheme: change.scheme || "file",
              authority: change.authority || "",
              path: change.path || path,
              query: change.query || "",
              fragment: change.fragment || "",
            }),
            with: () => ({}),
          }),
        }),
        joinPath: (base: any, path: string) => ({
          fsPath: `${base.fsPath}/${path}`,
          scheme: base.scheme || "file",
          authority: base.authority || "",
          path: `${base.path}/${path}`,
          query: base.query || "",
          fragment: base.fragment || "",
          toString: () =>
            `${base.scheme || "file"}://${base.authority || ""}${base.path}/${path}${base.query ? `?${base.query}` : ""}${base.fragment ? `#${base.fragment}` : ""}`,
          toJSON: () => ({
            scheme: base.scheme || "file",
            authority: base.authority || "",
            path: `${base.path}/${path}`,
            query: base.query || "",
            fragment: base.fragment || "",
          }),
          with: (change: {
            scheme?: string;
            authority?: string;
            path?: string;
            query?: string;
            fragment?: string;
          }) => ({
            fsPath: change.path || `${base.fsPath}/${path}`,
            scheme: change.scheme || base.scheme || "file",
            authority: change.authority || base.authority || "",
            path: change.path || `${base.path}/${path}`,
            query: change.query || base.query || "",
            fragment: change.fragment || base.fragment || "",
            toString: () =>
              `${change.scheme || base.scheme || "file"}://${change.authority || base.authority || ""}${change.path || `${base.path}/${path}`}${change.query || base.query ? `?${change.query || base.query}` : ""}${change.fragment || base.fragment ? `#${change.fragment || base.fragment}` : ""}`,
            toJSON: () => ({
              scheme: change.scheme || base.scheme || "file",
              authority: change.authority || base.authority || "",
              path: change.path || `${base.path}/${path}`,
              query: change.query || base.query || "",
              fragment: change.fragment || base.fragment || "",
            }),
            with: () => ({}),
          }),
        }),
        parse: (value: string) => {
          const schemeMatch = value.match(/^(\w+):\/\//);
          const scheme = schemeMatch ? schemeMatch[1] : "file";
          const path = value.replace(/^\w+:\/\//, "");
          return {
            fsPath: path,
            scheme: scheme,
            authority: "",
            path: path,
            query: "",
            fragment: "",
            toString: () => value,
            toJSON: () => ({ scheme: scheme, authority: "", path: path, query: "", fragment: "" }),
            with: () => ({}),
          };
        },
      },
      extensions: {
        getExtension: mockGetExtension,
        all: [],
      },
      commands: {
        executeCommand: mockExecuteCommand,
        registerCommand: () => ({ dispose: () => {} }),
      },
      CompletionItemKind: {
        Text: 0,
        Method: 1,
        Function: 2,
        Constructor: 3,
        Field: 4,
        Variable: 5,
        Class: 6,
        Interface: 7,
        Module: 8,
        Property: 9,
        Unit: 10,
        Value: 11,
        Enum: 12,
        Keyword: 13,
        Snippet: 14,
        Color: 15,
        File: 16,
        Reference: 17,
        Folder: 18,
        EnumMember: 19,
        Constant: 20,
        Struct: 21,
        Event: 22,
        Operator: 23,
        TypeParameter: 24,
      },
      ExtensionMode: {
        Production: 1,
        Development: 2,
        Test: 3,
      },
      Position: class Position {
        constructor(
          public line: number,
          public character: number,
        ) {}
      },
      Range: class Range {
        constructor(
          public start: any,
          public end: any,
        ) {}
      },
      Selection: class Selection {
        start: { line: number; character: number };
        end: { line: number; character: number };
        constructor(start: any, character?: number, end?: any, endCharacter?: number) {
          if (typeof start === "number") {
            this.start = { line: start, character: character || 0 };
            this.end = {
              line: typeof end === "number" ? end : start,
              character: endCharacter || 0,
            };
          } else {
            this.start = start;
            this.end = end;
          }
        }
      },
      ExtensionContext: class ExtensionContext {
        subscriptions: any[] = [];
        extensionUri = { fsPath: "/test/extension" };
        extensionPath = "/test/extension";
        globalState = {
          get: () => null,
          update: () => Promise.resolve(),
          keys: () => [],
          setKeysForSync: () => {},
        };
        workspaceState = {
          get: () => null,
          update: () => Promise.resolve(),
          keys: () => [],
        };
        secrets = {
          get: () => Promise.resolve(null),
          store: () => Promise.resolve(),
          delete: () => Promise.resolve(),
        };
        extensionMode = 3; // Test mode
        environmentVariableCollection = {
          persistent: false,
          replace: () => {},
          append: () => {},
          prepend: () => {},
          get: () => undefined,
          forEach: () => {},
          delete: () => {},
          clear: () => {},
        };
        storageUri = { fsPath: "/test/storage" };
        globalStorageUri = { fsPath: "/test/global-storage" };
        logUri = { fsPath: "/test/logs" };
        logPath = "/test/logs";
        storagePath = "/test/storage";
        globalStoragePath = "/test/global-storage";
        extension = {
          id: "test.extension",
          extensionUri: { fsPath: "/test/extension" },
          extensionPath: "/test/extension",
          isActive: true,
          packageJSON: {},
          activate: () => Promise.resolve({}),
          exports: {},
        };
        languageModelAccessInformation = {
          canSendRequest: () => false,
          canSendRequestToProvider: () => false,
          canUseModels: () => false,
          canUseModel: () => false,
        };

        asAbsolutePath(relativePath: string): string {
          return path.resolve("/test/extension", relativePath);
        }
      },
    };
  }

  // 在任何测试文件导入之前设置 vscode 模拟
  if (!(global as any).vscode) {
    (global as any).vscode = createVSCodeMock();
  }

  // 设置其他必要的全局模拟
  (global as any).WebAssembly = {
    compile: () => Promise.resolve({}),
    instantiate: () => Promise.resolve({}),
  };

  (global as any).Wasm = {
    load: () =>
      Promise.resolve({
        createProcess: () =>
          Promise.resolve({
            stderr: {
              onData: () => {},
            },
          }),
      }),
  };

  // 设置测试环境变量
  process.env.NODE_ENV = "test";

  console.log("✅ vscode 模拟已设置完成");
}
