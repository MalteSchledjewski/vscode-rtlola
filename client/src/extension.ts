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
        // Untitled files go to a default client.
        if (uri.scheme === 'untitled' && !defaultClient) {
            const debugOptions = { execArgv: ["--nolazy", "--inspect=6010"] };
            const serverOptions = {
                run: { module, transport: TransportKind.ipc },
                debug: { module, transport: TransportKind.ipc, options: debugOptions }
            };
            const clientOptions: LanguageClientOptions = {
                documentSelector: [
                    { scheme: 'untitled', language: 'rtlola' }
                ],
                diagnosticCollectionName: 'rtlola-lsp',
                outputChannel: outputChannel
            };
            defaultClient = new LanguageClient('rtlola-lsp', 'RTLola Language Server', serverOptions, clientOptions);
            defaultClient.start();
            return;
        }
        const folder = Workspace.getWorkspaceFolder(uri);
        // Files outside a folder can't be handled. This might depend on the language.
        // Single file languages like JSON might handle files outside the workspace folders.
        if (!folder) {
            return;
        }

        if (!clients.has(folder.uri.toString())) {
            const debugOptions = { execArgv: ["--nolazy", `--inspect=${6011 + clients.size}`] };
            const serverOptions = {
                run: { module, transport: TransportKind.ipc },
                debug: { module, transport: TransportKind.ipc, options: debugOptions }
            };
            const clientOptions: LanguageClientOptions = {
                documentSelector: [
                    { scheme: 'file', language: 'plaintext', pattern: `${folder.uri.fsPath}/**/*` }
                ],
                diagnosticCollectionName: 'lsp-multi-server-example',
                workspaceFolder: folder,
                outputChannel: outputChannel
            };
            const client = new LanguageClient('rtlola-lsp', 'RTLola Language Server', serverOptions, clientOptions);
            client.start();
            clients.set(folder.uri.toString(), client);
        }
    }

    Workspace.onDidOpenTextDocument(didOpenTextDocument);
    Workspace.textDocuments.forEach(didOpenTextDocument);
    Workspace.onDidChangeWorkspaceFolders((event) => {
        for (const folder of event.removed) {
            const client = clients.get(folder.uri.toString());
            if (client) {
                clients.delete(folder.uri.toString());
                client.stop();
            }
        }
    });
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

