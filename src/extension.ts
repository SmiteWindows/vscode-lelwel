import {
  ExtensionContext,
  Uri,
  workspace,
  window,
  commands,
  TextDocument,
  TextEdit,
  Range,
} from "vscode";
import { LanguageClient, LanguageClientOptions, ServerOptions } from "vscode-languageclient/node";
import { Wasm, ProcessOptions } from "@vscode/wasm-wasi/v1";
import { createStdioOptions, createUriConverters, startServer } from "@vscode/wasm-wasi-lsp";
import { performanceMonitor } from "./utils/performance";

const NATIVE_LELWEL_CONFIGURATION = "lelwel.nativeLsp";
const FORMAT_MAX_LINE_WIDTH_CONFIGURATION = "lelwel.format.maxLineWidth";
const FORMAT_USE_TABS_CONFIGURATION = "lelwel.format.useTabs";
const FORMAT_NEW_LINE_CONFIGURATION = "lelwel.format.newLine";

let client: LanguageClient | null = null;
let isWasmLoaded = false;
let wasmInstance: Wasm | null = null;
let isStarting = false;
let startPromise: Promise<void> | null = null;

export async function activate(context: ExtensionContext): Promise<void> {
  // 使用性能监控
  performanceMonitor.startTimer("extension-activation");

  try {
    // 防止重复激活
    if (isStarting) {
      return startPromise || Promise.resolve();
    }

    isStarting = true;
    startPromise = startLsp(context);

    try {
      await startPromise;
    } finally {
      isStarting = false;
    }

    // 注册格式化命令
    context.subscriptions.push(
      commands.registerTextEditorCommand("lelwel.formatDocument", formatDocument),
    );

    // 初始化数据库连接（如果需要）
    await initializeDatabase(context);

    // 防止配置变更时的竞态条件
    let updateClientSync = Promise.resolve();
    context.subscriptions.push(
      workspace.onDidChangeConfiguration(async (e) => {
        if (e.affectsConfiguration(NATIVE_LELWEL_CONFIGURATION)) {
          updateClientSync = updateClientSync
            .then(() => startLsp(context))
            .catch((error) => {
              console.error("Failed to restart language server after configuration change:", error);
              window.showErrorMessage(
                `Failed to restart language server: ${error instanceof Error ? error.message : String(error)}`,
              );
            });
        }

        // 处理格式化配置变更，不需要重启语言服务器
        if (e.affectsConfiguration(FORMAT_MAX_LINE_WIDTH_CONFIGURATION)) {
          console.log("最大行宽配置已变更，下次格式化时将使用新设置");
        }

        if (e.affectsConfiguration(FORMAT_USE_TABS_CONFIGURATION)) {
          console.log("Tab配置已变更，下次格式化时将使用新设置");
        }

        if (e.affectsConfiguration(FORMAT_NEW_LINE_CONFIGURATION)) {
          console.log("换行符配置已变更，下次格式化时将使用新设置");
        }
      }),
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Extension activation failed:", error);
    window.showErrorMessage(`Extension activation failed: ${errorMessage}`);
    throw error;
  } finally {
    performanceMonitor.endTimer("extension-activation");
    console.log(
      `Extension activation took: ${performanceMonitor.getAverageTime("extension-activation")}ms`,
    );
  }
}

// 初始化数据库连接（利用 Bun 1.3.9 的内置数据库客户端）
async function initializeDatabase(_context: ExtensionContext): Promise<void> {
  try {
    // 使用数据库工具模块
    const { initializeDatabase, saveUserSetting } = await import("./utils/database");

    // 初始化数据库
    initializeDatabase();

    // 保存设置
    const config = workspace.getConfiguration("lelwel");
    saveUserSetting("nativeLsp", config.get("nativeLsp", false));
    saveUserSetting("formatMaxLineWidth", config.get("format.maxLineWidth", 100));
  } catch (error) {
    console.warn("Failed to initialize database:", error);
  }
}

function useNativeLelwel(): boolean {
  const currentDocument = window.activeTextEditor?.document;
  const config = workspace.getConfiguration("", currentDocument?.uri);
  const value = config.get<boolean>(NATIVE_LELWEL_CONFIGURATION);

  return value === true;
}

// 优化的 WASM 加载函数，利用 Bun 的快速 WASM 编译
async function loadWasmModule(filename: Uri): Promise<WebAssembly.Module> {
  const bits = await workspace.fs.readFile(filename);

  // 使用 Bun 的快速 WASM 编译（如果可用）
  if (typeof Bun !== "undefined") {
    try {
      // 使用 Bun 的原生 WASM 编译器，比 WebAssembly.compile 更快
      return await (Bun as any).compile(bits);
    } catch (error) {
      console.warn("Bun WASM compilation failed, falling back to WebAssembly.compile", error);
    }
  }

  // 回退到标准 WebAssembly 编译
  return await WebAssembly.compile(bits);
}

// 优化的 WASM 实例加载，支持缓存
async function getWasmInstance(): Promise<Wasm> {
  if (isWasmLoaded && wasmInstance) {
    return wasmInstance;
  }

  wasmInstance = await Wasm.load();
  isWasmLoaded = true;
  return wasmInstance;
}

async function startLsp(context: ExtensionContext): Promise<void> {
  // 停止现有客户端
  if (client) {
    try {
      await client.stop();
    } catch (error) {
      console.warn("Error stopping client:", error);
    }
    client = null;
  }

  let serverOptions: ServerOptions;
  let clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: "file", language: "lelwel" }],
  };

  try {
    if (useNativeLelwel()) {
      serverOptions = {
        run: { command: "lelwel-ls" },
        debug: { command: "lelwel-ls" },
      };
    } else {
      const wasm = await getWasmInstance();
      const channel = window.createOutputChannel("Lelwel WASM LS");

      serverOptions = async () => {
        const options: ProcessOptions = {
          stdio: createStdioOptions(),
          mountPoints: [{ kind: "workspaceFolder" }],
        };
        const filename = Uri.joinPath(context.extensionUri, "server", "lelwel-ls.wasm");

        try {
          // 检查 WASM 文件是否存在
          try {
            await workspace.fs.stat(filename);
          } catch {
            throw new Error(
              `WASM file not found at ${filename.fsPath}. Please run 'bun build-wasm' to generate it.`,
            );
          }

          const module = await loadWasmModule(filename);
          const process = await wasm.createProcess(
            "lelwel-ls",
            module,
            // Must correspond to the Rust `--initial-memory` and `--max-memory` flags
            // e.g. --initial-memory=10485760 == 160 (multiplied by 65536)
            // See CONTRIBUTING.md
            { initial: 160, maximum: 2000, shared: true },
            options,
          );

          const decoder = new TextDecoder("utf-8");
          process.stderr!.onData((data) => {
            channel.append(decoder.decode(data));
          });

          return startServer(process);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.stack || error.message : String(error);
          channel.appendLine(`Failed to start WASM LSP: ${errorMessage}`);
          channel.show();

          // 在开发环境中提供更详细的错误信息
          if (process.env.NODE_ENV === "development") {
            console.error("WASM LSP startup error:", error);
          }

          throw error;
        }
      };

      clientOptions.outputChannel = channel as any;
      clientOptions.uriConverters = createUriConverters() as any;
    }

    client = new LanguageClient(
      "lelwelLanguageServer",
      "lelwel language server",
      serverOptions,
      clientOptions,
    );

    await client.start();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.stack || error.message : String(error);

    if (client) {
      client.error(`Start failed: ${errorMessage}`, error, "force");
    } else {
      console.error(`Language client start failed: ${errorMessage}`);
    }

    // 在开发环境中提供更详细的错误信息
    if (process.env.NODE_ENV === "development") {
      console.error("Full error details:", error);
    }

    // 重新抛出错误，让调用者处理
    throw error;
  }
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }

  try {
    return client.stop();
  } catch (error) {
    console.warn("Error during deactivation:", error);
    return Promise.resolve();
  } finally {
    client = null;
    isWasmLoaded = false;
    wasmInstance = null;
  }
}

// 格式化文档命令
async function formatDocument(textEditor: import("vscode").TextEditor) {
  const document = textEditor.document;

  if (document.languageId !== "lelwel") {
    window.showWarningMessage("格式化命令仅适用于lelwel文件");
    return;
  }

  try {
    // 获取格式化配置
    const formatOptions = getFormatOptions(document, textEditor);

    // 使用LSP服务器的格式化功能
    if (client) {
      const edits = await client.sendRequest("textDocument/formatting", {
        textDocument: { uri: document.uri.toString() },
        options: formatOptions,
      });

      if (edits && Array.isArray(edits) && edits.length > 0) {
        const edit = new TextEdit(
          new Range(document.positionAt(0), document.positionAt(document.getText().length)),
          (edits[0] as any).newText,
        );

        await textEditor.edit((editBuilder) => {
          editBuilder.replace(edit.range, edit.newText);
        });
      }
    }
  } catch (error) {
    console.error("格式化失败:", error);
    window.showErrorMessage(
      "格式化失败: " + (error instanceof Error ? error.message : String(error)),
    );
  }
}

// 获取格式化配置选项（基于 dprint-core 的参数）
function getFormatOptions(document: TextDocument, textEditor: import("vscode").TextEditor): any {
  const config = workspace.getConfiguration("", document.uri);
  const newLineSetting = config.get<string>(FORMAT_NEW_LINE_CONFIGURATION) || "lf";

  return {
    tabSize: Number(textEditor.options.tabSize),
    insertSpaces: Boolean(textEditor.options.insertSpaces),
    maxLineWidth: config.get<number>(FORMAT_MAX_LINE_WIDTH_CONFIGURATION) || 100,
    useTabs: config.get<boolean>(FORMAT_USE_TABS_CONFIGURATION) || false,
    newLineText: newLineSetting === "crlf" ? "\r\n" : "\n",
  };
}
