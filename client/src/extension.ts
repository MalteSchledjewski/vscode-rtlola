import * as path from "path";
import {
  workspace as Workspace,
  window as Window,
  ExtensionContext,
  OutputChannel,
} from "vscode";

import {
  LanguageClient,
  LanguageClientOptions,
  TransportKind,
} from "vscode-languageclient/node";

let defaultClient: LanguageClient;

export function activate(context: ExtensionContext) {
  const module = context.asAbsolutePath(path.join("dist", "server.js"));
  const outputChannel: OutputChannel = Window.createOutputChannel("rtlola-lsp");
  const debugOptions = { execArgv: ["--nolazy", "--inspect=6009"] };
  const serverOptions = {
    run: { module, transport: TransportKind.ipc },
    debug: { module, transport: TransportKind.ipc, options: debugOptions },
  };
  const clientOptions: LanguageClientOptions = {
    documentSelector: [
      { scheme: "untitled", language: "rtlola" },
      { scheme: "file", language: "rtlola" },
    ],
    diagnosticCollectionName: "rtlola-lsp",
    outputChannel: outputChannel,
  };
  defaultClient = new LanguageClient(
    "rtlola-lsp",
    "RTLola Language Server",
    serverOptions,
    clientOptions
  );
  defaultClient.start();
}

export function deactivate(): Thenable<void> {
  return defaultClient.stop();
}
