import { createConnection, ProposedFeatures } from "vscode-languageserver/node";

import startServer from "rtlola-language-server-integration";

// Creates the LSP connection
const connection = createConnection(ProposedFeatures.all);

startServer(connection).then(() =>
  connection.console.log(`[Server(${process.pid})] started`)
);
