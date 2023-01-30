/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

//@ts-check

"use strict";
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
/**@type {import('webpack').Configuration}*/
const config = {
  target: "node", // vscode extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/
  // experiments: { asyncWebAssembly: true },
  entry: {
    extension: {
      import: "./client/src/extension.ts",
      filename: "extension.js",
    },
    server: {
      import: "./server/src/server.ts",
      filename: "server.js",
    },
  }, // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
  output: {
    // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
    // path: path.resolve(__dirname, "dist"),
    // filename: "extension.js",
    libraryTarget: "commonjs2",
    devtoolModuleFilenameTemplate: "../[resource-path]",
  },
  devtool: "source-map",
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: path
            .resolve(
              __dirname,
              "node_modules/rtlola-language-server-integration/dist/rtlola_language_server_node_bg.wasm*"
            )
            .replace(/\\/g, "/"),
          to: "[name][ext]",
        },
      ],
    }),
  ],
  externals: {
    vscode: "commonjs vscode", // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
  },
  resolve: {
    // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
    extensions: [".ts", ".js"],
    // mainFields: ["browser", "module", "main"], // look for `browser` entry point in imported node modules
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
            options: {
              compilerOptions: {
                module: "es6", // override `tsconfig.json` so that TypeScript emits native JavaScript modules.
              },
            },
          },
        ],
      },
    ],
  },
};

module.exports = config;
