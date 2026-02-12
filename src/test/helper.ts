/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as path from "path";
import * as fs from "fs";

// 使用全局 vscode 模拟，避免模块导入错误
const vscode = (global as any).vscode;

export let doc: any;
export let editor: any;

/**
 * Get test document path
 */
export const getDocPath = (p: string): string => {
  const fixturePath = path.resolve(__dirname, "../../../testFixture");

  // Ensure test fixture directory exists
  if (!fs.existsSync(fixturePath)) {
    fs.mkdirSync(fixturePath, { recursive: true });
  }

  return path.resolve(fixturePath, p);
};

/**
 * Get test document URI
 */
export const getDocUri = (p: string): any => {
  return vscode.Uri.file(getDocPath(p));
};

/**
 * Create test document with content
 */
export async function createTestDocument(
  content: string = "",
  fileName: string = "test.llw",
): Promise<any> {
  const filePath = getDocPath(fileName);

  // Write test content to file
  fs.writeFileSync(filePath, content, "utf8");

  // Create mock document
  const mockDocument: any = {
    uri: vscode.Uri.file(filePath),
    fileName: filePath,
    isUntitled: false,
    languageId: "lelwel",
    version: 1,
    isDirty: false,
    isClosed: false,
    encoding: "utf8",
    save: () => Promise.resolve(true),
    eol: 1, // LF
    lineCount: content.split("\n").length,

    getText: (range?: any): string => {
      if (!range) return content;
      const lines = content.split("\n");
      let result = "";
      for (let i = range.start.line; i <= range.end.line; i++) {
        if (i >= lines.length) break;
        const line = lines[i] || "";
        if (i === range.start.line && i === range.end.line) {
          result += line.substring(range.start.character, range.end.character);
        } else if (i === range.start.line) {
          result += line.substring(range.start.character) + "\n";
        } else if (i === range.end.line) {
          result += line.substring(0, range.end.character);
        } else {
          result += line + "\n";
        }
      }
      return result;
    },

    lineAt: (line: number): any => {
      const lines = content.split("\n");
      const lineText = lines[line] || "";
      return {
        lineNumber: line,
        text: lineText,
        range: { start: { line, character: 0 }, end: { line, character: lineText.length } },
        rangeIncludingLineBreak: {
          start: { line, character: 0 },
          end: { line, character: lineText.length },
        },
        firstNonWhitespaceCharacterIndex: lineText.search(/\S/),
        isEmptyOrWhitespace: lineText.trim().length === 0,
      };
    },

    positionAt: (offset: number): any => {
      const lines = content.substring(0, offset).split("\n");
      const lineIndex = Math.max(0, lines.length - 1);
      const lineText = lines[lineIndex] || "";
      return { line: lineIndex, character: lineText.length };
    },

    offsetAt: (position: any): number => {
      const lines = content.split("\n");
      let offset = 0;
      for (let i = 0; i < position.line && i < lines.length; i++) {
        offset += (lines[i] || "").length + 1; // +1 for newline
      }
      offset += Math.min(position.character, lines[position.line]?.length || 0);
      return offset;
    },

    getWordRangeAtPosition: (position: any, regex?: RegExp): any => {
      const lines = content.split("\n");
      const lineText = lines[position.line] || "";

      if (regex) {
        const matches = lineText.match(regex);
        if (matches) {
          const matchIndex = lineText.indexOf(matches[0]);
          return {
            start: { line: position.line, character: matchIndex },
            end: { line: position.line, character: matchIndex + matches[0].length },
          };
        }
      }

      // 简单的单词检测
      const wordRegex = /\w+/g;
      let match;
      while ((match = wordRegex.exec(lineText)) !== null) {
        if (
          position.character >= match.index &&
          position.character <= match.index + match[0].length
        ) {
          return {
            start: { line: position.line, character: match.index },
            end: { line: position.line, character: match.index + match[0].length },
          };
        }
      }

      return undefined;
    },

    validateRange: (range: any): any => range,
    validatePosition: (position: any): any => position,
  };

  return mockDocument;
}

/**
 * Activate extension with test document
 */
export async function activate(docUri: any): Promise<{ doc: any; editor: any }> {
  try {
    // Simulate extension activation
    const ext = vscode.extensions.getExtension("0x2a-42.lelwel");
    if (ext) {
      await ext.activate();
    }

    // Create test document using the provided URI
    const fileContent = fs.existsSync(docUri.fsPath) ? fs.readFileSync(docUri.fsPath, "utf8") : "";
    doc = await createTestDocument(fileContent, path.basename(docUri.fsPath));

    // Create mock editor
    const mockEditor: any = {
      document: doc,
      selection: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
      selections: [{ start: { line: 0, character: 0 }, end: { line: 0, character: 0 } }],
      visibleRanges: [{ start: { line: 0, character: 0 }, end: { line: 0, character: 0 } }],
      options: {},
      viewColumn: 1, // ViewColumn.One

      edit: (callback: (editBuilder: any) => void): Promise<boolean> => {
        // Simple mock implementation
        return Promise.resolve(true);
      },

      insertSnippet: (snippet: any, location?: any): Promise<boolean> => {
        return Promise.resolve(true);
      },

      setDecorations: (decorationType: any, rangesOrOptions: any): void => {
        // Mock implementation
      },

      revealRange: (range: any, revealType?: any): void => {
        // Mock implementation
      },

      show: (column?: any): void => {
        // Mock implementation
      },

      hide: (): void => {
        // Mock implementation
      },
    };

    editor = mockEditor;
    return { doc, editor };
  } catch (e) {
    console.error("Extension activation failed:", e);
    throw e;
  }
}

/**
 * Set test content in document
 */
export async function setTestContent(content: string): Promise<boolean> {
  if (!doc) {
    throw new Error("Document not initialized. Call activate() first.");
  }

  // Update document content
  const filePath = doc.uri.fsPath;
  fs.writeFileSync(filePath, content, "utf8");

  // Recreate document with new content
  doc = await createTestDocument(content, path.basename(filePath));

  return true;
}

/**
 * Cleanup test files
 */
export function cleanupTestFiles(): void {
  const fixturePath = path.resolve(__dirname, "../../../testFixture");
  if (fs.existsSync(fixturePath)) {
    fs.rmSync(fixturePath, { recursive: true, force: true });
  }
}
