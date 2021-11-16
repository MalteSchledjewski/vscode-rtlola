import * as path from 'path';
import {
    workspace as Workspace, window as Window, ExtensionContext, TextDocument, OutputChannel, WorkspaceFolder, Uri
} from 'vscode';

import {
    LanguageClient, LanguageClientOptions, TransportKind
} from 'vscode-languageclient/node';

let defaultClient: LanguageClient;
const clients: Map<string, LanguageClient> = new Map();


export function activate(context: ExtensionContext) {

    const module = context.asAbsolutePath(path.join('server', 'out', 'server.js'));
    const outputChannel: OutputChannel = Window.createOutputChannel('rtlola-lsp');

    function didOpenTextDocument(document: TextDocument): void {
        // We are only interested in language mode text
        if (document.languageId !== 'rtlola' || (document.uri.scheme !== 'file' && document.uri.scheme !== 'untitled')) {
            return;
        }

        const uri = document.uri;
        const debugOptions = { execArgv: ["--nolazy", "--inspect=6009"] };
        const serverOptions = {
            run: { module, transport: TransportKind.ipc },
            debug: { module, transport: TransportKind.ipc, options: debugOptions }
        };
        const clientOptions: LanguageClientOptions = {
            documentSelector: [
                { scheme: 'untitled', language: 'rtlola' },
                { scheme: 'file', language: 'rtlola' }
            ],
            diagnosticCollectionName: 'rtlola-lsp',
            outputChannel: outputChannel
        };
        defaultClient = new LanguageClient('rtlola-lsp', 'RTLola Language Server', serverOptions, clientOptions);
        defaultClient.start();
    }

    Workspace.onDidOpenTextDocument(didOpenTextDocument);
    Workspace.textDocuments.forEach(didOpenTextDocument);
}

export function deactivate(): Thenable<void> {
    const promises: Thenable<void>[] = [];
    if (defaultClient) {
        promises.push(defaultClient.stop());
    }
    for (const client of clients.values()) {
        promises.push(client.stop());
    }
    return Promise.all(promises).then(() => undefined);
}

