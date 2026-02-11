// 全局设置文件 - 在任何测试文件导入之前执行
// 创建完整的 VS Code API 模拟
if (!(global as any).vscode) {
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
      version: "1.89.0",
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
          path: path,
          with: () => ({}),
        }),
        joinPath: (base: any, path: string) => ({
          fsPath: `${base.fsPath}/${path}`,
          scheme: "file",
          path: `${base.path}/${path}`,
          with: () => ({}),
        }),
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
