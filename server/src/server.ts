import {
	createConnection,
	TextDocuments,
	Diagnostic,
	DiagnosticSeverity,
	ProposedFeatures,
	InitializeParams,
	DidChangeConfigurationNotification,
	CompletionItem,
	CompletionItemKind,
	TextDocumentPositionParams,
	TextDocumentSyncKind,
	InitializeResult,
	WorkspaceFolder,
	DefinitionParams,
	Location
} from 'vscode-languageserver/node';

import {
	TextDocument
} from 'vscode-languageserver-textdocument';


import * as wasm from "rtlola-wasm";
import { TextEncoder } from 'util';

// Creates the LSP connection
const connection = createConnection(ProposedFeatures.all);

// Create a manager for open text documents
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;

documents.onDidOpen((event) => {
	connection.console.log(`[Server(${process.pid})] Document opened: ${event.document.uri}`);
});


connection.onInitialize((params: InitializeParams) => {
	connection.console.log(`[Server(${process.pid})] Started and initialize received`);
	const capabilities = params.capabilities;

	// Does the client support the `workspace/configuration` request?
	// If not, we fall back using global settings.
	hasConfigurationCapability = !!(
		capabilities.workspace && !!capabilities.workspace.configuration
	);
	hasWorkspaceFolderCapability = !!(
		capabilities.workspace && !!capabilities.workspace.workspaceFolders
	);
	hasDiagnosticRelatedInformationCapability = !!(
		capabilities.textDocument &&
		capabilities.textDocument.publishDiagnostics &&
		capabilities.textDocument.publishDiagnostics.relatedInformation
	);

	const result: InitializeResult = {
		capabilities: {
			textDocumentSync: TextDocumentSyncKind.Incremental,
			// Tell the client that this server supports code completion.
			completionProvider: {
				resolveProvider: true
			},
			definitionProvider: true,
		}
	};
	if (hasWorkspaceFolderCapability) {
		result.capabilities.workspace = {
			workspaceFolders: {
				supported: true
			}
		};
	}
	return result;
});


connection.onInitialized(() => {
	if (hasConfigurationCapability) {
		// Register for all configuration changes.
		connection.client.register(DidChangeConfigurationNotification.type, undefined);
	}
	if (hasWorkspaceFolderCapability) {
		connection.workspace.onDidChangeWorkspaceFolders(_event => {
			connection.console.log('Workspace folder change event received.');
		});
	}
});


// The language server settings
interface RTLolaLSSettings {
	maxNumberOfProblems: number;
}

// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.
const defaultSettings: RTLolaLSSettings = { maxNumberOfProblems: 1000 };
let globalSettings: RTLolaLSSettings = defaultSettings;

// Cache the settings of all open documents
const documentSettings: Map<string, Thenable<RTLolaLSSettings>> = new Map();

connection.onDidChangeConfiguration(change => {
	if (hasConfigurationCapability) {
		// Reset all cached document settings
		documentSettings.clear();
	} else {
		globalSettings = <RTLolaLSSettings>(
			(change.settings.languageServerExample || defaultSettings)
		);
	}

	// Revalidate all open text documents
	documents.all().forEach(validateTextDocument);
});

function getDocumentSettings(resource: string): Thenable<RTLolaLSSettings> {
	if (!hasConfigurationCapability) {
		return Promise.resolve(globalSettings);
	}
	let result = documentSettings.get(resource);
	if (!result) {
		result = connection.workspace.getConfiguration({
			scopeUri: resource,
			section: 'rtlolaLS'
		});
		documentSettings.set(resource, result);
	}
	return result;
}

// Only keep settings for open documents
documents.onDidClose(e => {
	documentSettings.delete(e.document.uri);
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(change => {
	validateTextDocument(change.document);
});

function hasOwnProperty<X extends unknown, Y extends PropertyKey>
	(obj: X, prop: Y): obj is X & Record<Y, unknown> {
	// eslint-disable-next-line no-prototype-builtins
	return obj.hasOwnProperty(prop);
}

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
	// we get the settings for every validate run.
	const settings = await getDocumentSettings(textDocument.uri);
	const text = textDocument.getText();
	let diagnostics: Diagnostic[] = [];
	try {
		const spec = new TextEncoder().encode(text);
		wasm.generate_ir(textDocument.uri, spec);
	}
	catch (e: unknown) {
		if (typeof (e) === "object" && hasOwnProperty(e, 'Frontend')) {
			diagnostics = e.Frontend as Diagnostic[];
		}
	}

	diagnostics.splice(settings.maxNumberOfProblems);

	// Send the computed diagnostics to VSCode.
	connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

connection.onDidChangeWatchedFiles(_change => {
	// Monitored files have change in VSCode
	connection.console.log('We received an file change event');
});

// This handler provides the initial list of the completion items.
connection.onCompletion(
	(textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
		const spec = new TextEncoder().encode(documents.get(textDocumentPosition.textDocument.uri).getText());
		try {
			return wasm.generate_completions(textDocumentPosition.textDocument.uri, spec, JSON.stringify(textDocumentPosition.position));
		}
		catch (e: unknown) {
			connection.console.log('error during parsing so we do not provide completions');
			return [];
		}
		return [];
	}
);

// This handler resolves additional information for the item selected in
// the completion list.
connection.onCompletionResolve(
	(item: CompletionItem): CompletionItem => {
		return item;
	}
);


connection.onDefinition(
	(item: DefinitionParams): Location[] => {
		const spec = new TextEncoder().encode(documents.get(item.textDocument.uri).getText());
		try {
			return wasm.go_to_definition(item.textDocument.uri, spec, JSON.stringify(item.position));
		}
		catch (e: unknown) {
			connection.console.log('error during parsing so we do not provide go to definition');
			return [];
		}
	}
);


// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

connection.listen();