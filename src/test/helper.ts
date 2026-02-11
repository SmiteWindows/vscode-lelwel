/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

export let doc: vscode.TextDocument;
export let editor: vscode.TextEditor;

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
export const getDocUri = (p: string): vscode.Uri => {
  return vscode.Uri.file(getDocPath(p));
};

/**
 * Create test document with content
 */
export async function createTestDocument(
  content: string = "",
  fileName: string = "test.llw",
): Promise<vscode.TextDocument> {
  const filePath = getDocPath(fileName);

  // Write test content to file
  fs.writeFileSync(filePath, content, "utf8");

  // Create mock document
  const mockDocument: vscode.TextDocument = {
    uri: vscode.Uri.file(filePath),
    fileName: filePath,
    isUntitled: false,
    languageId: "lelwel",
    version: 1,
    isDirty: false,
    isClosed: false,
    save: () => Promise.resolve(true),
    eol: vscode.EndOfLine.LF,
    lineCount: content.split("\n").length,

    getText: (range?: vscode.Range): string => {
      if (!range) return content;
      const lines = content.split("\n");
      let result = "";
      for (let i = range.start.line; i <= range.end.line; i++) {
        if (i >= lines.length) break;
        const line = lines[i];
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

    positionAt: (offset: number): vscode.Position => {
      const lines = content.substring(0, offset).split("\n");
      return new vscode.Position(lines.length - 1, lines[lines.length - 1].length);
    },

    offsetAt: (position: vscode.Position): number => {
      const lines = content.split("\n");
      let offset = 0;
      for (let i = 0; i < position.line; i++) {
        if (i < lines.length) {
          offset += lines[i].length + 1; // +1 for newline
        }
      }
      offset += position.character;
      return Math.min(offset, content.length);
    },

    getWordRangeAtPosition: (
      position: vscode.Position,
      regex?: RegExp,
    ): vscode.Range | undefined => {
      // Simple word detection for testing
      const line = content.split("\n")[position.line] || "";
      const lineText = line.substring(0, position.character);
      const match = lineText.match(/\w+$/);
      if (match) {
        const start = match.index || 0;
        return new vscode.Range(position.line, start, position.line, start + match[0].length);
      }
      return undefined;
    },

    validateRange: (range: vscode.Range): vscode.Range => range,
    validatePosition: (position: vscode.Position): vscode.Position => position,
  };

  return mockDocument;
}

/**
 * Activate extension with test document
 */
export async function activate(
  docUri: vscode.Uri,
): Promise<{ doc: vscode.TextDocument; editor: vscode.TextEditor }> {
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
    const mockEditor: vscode.TextEditor = {
      document: doc,
      selection: new vscode.Selection(0, 0, 0, 0),
      selections: [new vscode.Selection(0, 0, 0, 0)],
      visibleRanges: [new vscode.Range(0, 0, 0, 0)],
      options: {},
      viewColumn: vscode.ViewColumn.One,

      edit: (callback: (editBuilder: vscode.TextEditorEdit) => void): Thenable<boolean> => {
        // Simple mock implementation
        return Promise.resolve(true);
      },

      insertSnippet: (
        snippet: vscode.SnippetString,
        location?: vscode.Position | vscode.Range | vscode.Position[] | vscode.Range[],
      ): Thenable<boolean> => {
        return Promise.resolve(true);
      },

      setDecorations: (
        decorationType: vscode.TextEditorDecorationType,
        rangesOrOptions: vscode.Range[] | vscode.DecorationOptions[],
      ): void => {
        // Mock implementation
      },

      revealRange: (range: vscode.Range, revealType?: vscode.TextEditorRevealType): void => {
        // Mock implementation
      },

      show: (column?: vscode.ViewColumn): void => {
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
